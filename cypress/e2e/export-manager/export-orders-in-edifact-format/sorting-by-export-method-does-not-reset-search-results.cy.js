import uuid from 'uuid';
import permissions from '../../../support/dictionary/permissions';
import devTeams from '../../../support/dictionary/devTeams';
import TopMenu from '../../../support/fragments/topMenu';
import Orders from '../../../support/fragments/orders/orders';
import TestTypes from '../../../support/dictionary/testTypes';
import Users from '../../../support/fragments/users/users';
import NewOrder from '../../../support/fragments/orders/newOrder';
import Organizations from '../../../support/fragments/organizations/organizations';
import NewOrganization from '../../../support/fragments/organizations/newOrganization';
import getRandomPostfix from '../../../support/utils/stringTools';
import OrderLines from '../../../support/fragments/orders/orderLines';
import ServicePoints from '../../../support/fragments/settings/tenant/servicePoints/servicePoints';
import NewLocation from '../../../support/fragments/settings/tenant/locations/newLocation';
import DateTools from '../../../support/utils/dateTools';
import ExportManagerSearchPane from '../../../support/fragments/exportManager/exportManagerSearchPane';

describe('orders: export', () => {
  const orderForFirstOrganization = { ...NewOrder.defaultOneTimeOrder };
  const orderForSecondOrganization = {
    id: uuid(),
    vendor: '',
    orderType: 'One-Time',
  };

  const firstOrganization = {
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
    ],
  };
  const secondOrganization = {
    name: `autotest_name_${getRandomPostfix()}`,
    status: 'Active',
    code: `autotest_code_${getRandomPostfix()}`,
    isVendor: true,
    erpCode: `ERP-${getRandomPostfix()}`,
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
    ],
  };
  const integrationNameForFirstOrganization = `FirstIntegrationName${getRandomPostfix()}`;
  const integrationNameForSecondOrganization = `SecondIntegrationName${getRandomPostfix()}`;
  const integartionDescription1 = 'Test Integation descripton1';
  const integartionDescription2 = 'Test Integation descripton2';
  const vendorEDICodeFor1Integration = getRandomPostfix();
  const libraryEDICodeFor1Integration = getRandomPostfix();
  const vendorEDICodeFor2Integration = getRandomPostfix();
  const libraryEDICodeFor2Integration = getRandomPostfix();
  let user;
  let location;
  let servicePointId;
  const UTCTime = DateTools.getUTCDateForScheduling();
  const UTCTimeForSecond = DateTools.getUTCDateFor2Scheduling();

  before(() => {
    cy.getAdminToken();

    ServicePoints.getViaApi().then((servicePoint) => {
      servicePointId = servicePoint[0].id;
      NewLocation.createViaApi(NewLocation.getDefaultLocation(servicePointId)).then((res) => {
        location = res;
      });
    });

    Organizations.createOrganizationViaApi(firstOrganization).then((organizationsResponse) => {
      firstOrganization.id = organizationsResponse;
      orderForFirstOrganization.vendor = firstOrganization.name;
      orderForFirstOrganization.orderType = 'One-time';

      cy.loginAsAdmin({ path: TopMenu.organizationsPath, waiter: Organizations.waitLoading });
      Organizations.searchByParameters('Name', firstOrganization.name);
      Organizations.checkSearchResults(firstOrganization);
      Organizations.selectOrganization(firstOrganization.name);
      Organizations.addIntegration();
      Organizations.fillIntegrationInformation(
        integrationNameForFirstOrganization,
        integartionDescription1,
        vendorEDICodeFor1Integration,
        libraryEDICodeFor1Integration,
        firstOrganization.accounts[0].accountNo,
        'Purchase',
        UTCTime,
      );

      Organizations.createOrganizationViaApi(secondOrganization).then(
        (secondOrganizationsResponse) => {
          secondOrganization.id = secondOrganizationsResponse;
          orderForSecondOrganization.vendor = secondOrganization.name;
          orderForSecondOrganization.orderType = 'One-time';

          cy.visit(TopMenu.organizationsPath);
          Organizations.searchByParameters('Name', secondOrganization.name);
          Organizations.checkSearchResults(secondOrganization);
          Organizations.selectOrganization(secondOrganization.name);
          Organizations.addIntegration();
          Organizations.fillIntegrationInformation(
            integrationNameForSecondOrganization,
            integartionDescription2,
            vendorEDICodeFor2Integration,
            libraryEDICodeFor2Integration,
            secondOrganization.accounts[0].accountNo,
            'Purchase',
            UTCTimeForSecond,
          );

          cy.visit(TopMenu.ordersPath);
          Orders.createOrder(orderForSecondOrganization, true, false).then((secondOrderId) => {
            orderForSecondOrganization.id = secondOrderId;
            Orders.createPOLineViaActions();
            OrderLines.selectRandomInstanceInTitleLookUP('*', 3);
            OrderLines.fillInPOLineInfoForExportWithLocation('Purchase', location.institutionId);
            OrderLines.backToEditingOrder();
          });
        },
      );

      cy.visit(TopMenu.ordersPath);
      Orders.createOrder(orderForFirstOrganization, true, false).then((firstOrderId) => {
        orderForFirstOrganization.id = firstOrderId;
        Orders.createPOLineViaActions();
        OrderLines.selectRandomInstanceInTitleLookUP('*', 10);
        OrderLines.fillInPOLineInfoForExportWithLocation('Purchase', location.institutionId);
        OrderLines.backToEditingOrder();
      });
    });

    cy.createTempUser([permissions.exportManagerAll.gui]).then((userProperties) => {
      user = userProperties;
      cy.login(user.username, user.password, {
        path: TopMenu.exportManagerOrganizationsPath,
        waiter: ExportManagerSearchPane.waitLoading,
      });
    });
  });

  after(() => {
    Orders.deleteOrderViaApi(orderForFirstOrganization.id);
    Orders.deleteOrderViaApi(orderForSecondOrganization.id);
    Organizations.deleteOrganizationViaApi(firstOrganization.id);
    Organizations.deleteOrganizationViaApi(secondOrganization.id);
    NewLocation.deleteViaApiIncludingInstitutionCampusLibrary(
      location.institutionId,
      location.campusId,
      location.libraryId,
      location.id,
    );
    Users.deleteViaApi(user.userId);
  });

  it(
    'C377045: Sorting by export method does not reset search results (thunderjet) (TaaS)',
    { tags: [TestTypes.smoke, devTeams.thunderjet] },
    () => {
      ExportManagerSearchPane.selectOrganizationsSearch();
      ExportManagerSearchPane.searchBySuccessful();
      ExportManagerSearchPane.searchByFailed();
      ExportManagerSearchPane.sortByJobID();
      ExportManagerSearchPane.selectJobByIntegrationInList(integrationNameForFirstOrganization);
      ExportManagerSearchPane.selectJobByIntegrationInList(integrationNameForSecondOrganization);
    },
  );
});
