import permissions from '../../support/dictionary/permissions';
import devTeams from '../../support/dictionary/devTeams';
import TopMenu from '../../support/fragments/topMenu';
import Orders from '../../support/fragments/orders/orders';
import TestTypes from '../../support/dictionary/testTypes';
import Users from '../../support/fragments/users/users';
import NewOrder from '../../support/fragments/orders/newOrder';
import Organizations from '../../support/fragments/organizations/organizations';
import NewOrganization from '../../support/fragments/organizations/newOrganization';
import getRandomPostfix from '../../support/utils/stringTools';
import InteractorsTools from '../../support/utils/interactorsTools';
import OrderLines from '../../support/fragments/orders/orderLines';
import ExportManagerSearchPane from '../../support/fragments/exportManager/exportManagerSearchPane';

describe('orders: export', () => {
  let user;
  const order = { ...NewOrder.defaultOneTimeOrder };
  const organization = {
    ...NewOrganization.defaultUiOrganizations,
    accounts: [
      {
        accountNo: getRandomPostfix(),
        accountStatus: 'Active',
        acqUnitIds: [],
        appSystemNo: '',
        description: 'Main library account',
        libraryCode: 'COB',
        libraryEdiCode: getRandomPostfix(),
        name: 'TestAccout1',
        notes: '',
        paymentMethod: 'Cash',
      },
    ]
  };
  const integrationName = `FirstIntegrationName${getRandomPostfix()}`;
  const integartionDescription = 'Test Integation descripton1';
  const vendorEDICodeFor1Integration = getRandomPostfix();
  const libraryEDICodeFor1Integration = getRandomPostfix();

  beforeEach(() => {
    cy.getAdminToken();
    Organizations.createOrganizationViaApi(organization)
      .then(response => {
        organization.id = response;
        order.vendor = organization.name;
        order.orderType = 'One-time';
      });
    cy.loginAsAdmin({ path:TopMenu.organizationsPath, waiter: Organizations.waitLoading });
    Organizations.searchByParameters('Name', organization.name);
    Organizations.checkSearchResults(organization);
    Organizations.selectOrganization(organization.name);
    Organizations.addIntegration();
    Organizations.fillIntegrationInformation(integrationName, integartionDescription, vendorEDICodeFor1Integration, libraryEDICodeFor1Integration, organization.accounts[0].accountNo, 'Purchase');
    InteractorsTools.checkCalloutMessage('Integration was saved');

    cy.createTempUser([
      permissions.uiOrdersView.gui,
      permissions.uiOrdersCreate.gui, 
      permissions.uiOrdersEdit.gui,
      permissions.uiOrdersApprovePurchaseOrders.gui,
      permissions.viewEditCreateOrganization.gui, 
      permissions.viewOrganization.gui,
      permissions.uiExportOrders.gui,
      permissions.exportManagerAll.gui,
    ])
      .then(userProperties => {
        user = userProperties;
        cy.login(user.username, user.password, { path:TopMenu.ordersPath, waiter: Orders.waitLoading });
      });
  });

  afterEach(() => {
    Orders.deleteOrderApi(order.id);
    Organizations.deleteOrganizationViaApi(organization.id);
    Users.deleteViaApi(user.userId);
  });

  it('C350396: Verify that Order is not exported to a definite Vendor if Acquisition method selected in the Order line DOES NOT match Organization Integration configs', { tags: [TestTypes.smoke, devTeams.thunderjet] }, () => {
    Orders.createOrder(order, true, false).then(orderId => {
      order.id = orderId;
      Orders.createPOLineViaActions();
      OrderLines.fillInPOLineInfoForExport(`${organization.accounts[0].name} (${organization.accounts[0].accountNo})`);
      OrderLines.backToEditingOrder();
    });
  });

  it('C350398: Verify that Order is not exported to a definite Vendor if Automatic export option in Order PO Line is disabled', { tags: [TestTypes.smoke, devTeams.thunderjet] }, () => {
    Orders.createOrder(order, true, true).then(orderId => {
      order.id = orderId;
      Orders.createPOLineViaActions();
      OrderLines.fillInPOLineInfoForExport(`${organization.accounts[0].name} (${organization.accounts[0].accountNo})`);
      OrderLines.backToEditingOrder();
      Orders.openOrder();
      cy.visit(TopMenu.exportManagerPath);
      ExportManagerSearchPane.searchById('Gobi Library Solutions');
    });
  });
}); 