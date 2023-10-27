import { including, Link } from '@interactors/html';

import { TestTypes, DevTeams, Permissions } from '../../support/dictionary';
import Users from '../../support/fragments/users/users';
import Checkout from '../../support/fragments/checkout/checkout';
import Requests from '../../support/fragments/requests/requests';
import RequestDetail from '../../support/fragments/requests/requestDetail';
import ServicePoints from '../../support/fragments/settings/tenant/servicePoints/servicePoints';
import { Locations } from '../../support/fragments/settings/tenant/location-setup';
import InventoryInstances from '../../support/fragments/inventory/inventoryInstances';
import SettingsMenu from '../../support/fragments/settingsMenu';
import TitleLevelRequests from '../../support/fragments/settings/circulation/titleLevelRequests';
import UserEdit from '../../support/fragments/users/userEdit';
import CheckOutActions from '../../support/fragments/check-out-actions/check-out-actions';
import { getTestEntityValue } from '../../support/utils/stringTools';
import PatronGroups from '../../support/fragments/settings/users/patronGroups';
import TopMenu from '../../support/fragments/topMenu';
import NewRequest from '../../support/fragments/requests/newRequest';
import { REQUEST_TYPES } from '../../support/constants';
import SearchPane from '../../support/fragments/circulation-log/searchPane';
import EditRequest from '../../support/fragments/requests/edit-request';
import InteractorsTools from '../../support/utils/interactorsTools';

describe('Title Level Request', () => {
  const testData = {
    folioInstances: InventoryInstances.generateFolioInstances({ count: 2 }),
    servicePoint: ServicePoints.getDefaultServicePointWithPickUpLocation(),
  };
  const patronGroup = {
    name: getTestEntityValue('GroupCircLog'),
  };
  let firstItemBarcode;
  let secondItemBarcode;
  const instanceLinkText = Link(including('Instance-')).text();

  before('Create test data', () => {
    cy.getAdminToken();
    cy.loginAsAdmin({
      path: SettingsMenu.circulationTitleLevelRequestsPath,
      waiter: TitleLevelRequests.waitLoading,
    });
    ServicePoints.createViaApi(testData.servicePoint);
    testData.defaultLocation = Locations.getDefaultLocation({
      servicePointId: testData.servicePoint.id,
    }).location;
    Locations.createViaApi(testData.defaultLocation).then((location) => {
      InventoryInstances.createFolioInstancesViaApi({
        folioInstances: testData.folioInstances,
        location,
      });
    });
    cy.getInstance({
      limit: 1,
      expandAll: true,
      query: `"id"=="${testData.folioInstances[0].instanceId}"`,
    }).then((instance) => {
      testData.instanceHRID = instance.hrid;
    });
    cy.getUsers({ limit: 1, query: '"barcode"="" and "active"="true"' }).then((users) => {
      testData.requester = users[0];
    });
    firstItemBarcode = testData.folioInstances[0].barcodes[0];
    secondItemBarcode = testData.folioInstances[1].barcodes[0];
    PatronGroups.createViaApi(patronGroup.name).then((patronGroupResponse) => {
      patronGroup.id = patronGroupResponse;
    });

    cy.createTempUser(
      [
        Permissions.checkoutAll.gui,
        Permissions.requestsAll.gui,
        Permissions.inventoryAll.gui,
        Permissions.circulationLogAll.gui,
        Permissions.uiUsersView.gui,
      ],
      patronGroup.name,
    ).then((user) => {
      testData.user = user;
      UserEdit.addServicePointViaApi(
        testData.servicePoint.id,
        testData.user.userId,
        testData.servicePoint.id,
      );
      TitleLevelRequests.changeTitleLevelRequestsStatus('allow');

      cy.login(testData.user.username, testData.user.password, {
        path: TopMenu.checkOutPath,
        waiter: Checkout.waitLoading,
      });
    });
  });

  after('Delete test data', () => {
    // Delete test user
    Users.deleteViaApi(testData.user.userId);
  });

  it(
    'C380500: Editing recall request does not change recalled item (vega) (TaaS)',
    {
      tags: [TestTypes.criticalPath, DevTeams.vega],
    },
    () => {
      cy.visit(TopMenu.checkOutPath);
      Checkout.waitLoading();
      // Enter patron id or choose patron with "Patron look-up" function.
      CheckOutActions.checkOutUser(testData.user.barcode);
      // Enter barcode for one of the items (described in Preconditions).
      CheckOutActions.checkOutItem(firstItemBarcode);
      Checkout.verifyResultsInTheRow([firstItemBarcode]);
      // Check out the second item from the instance described in Preconditions to another Patron.
      CheckOutActions.checkOutItem(secondItemBarcode);
      Checkout.verifyResultsInTheRow([secondItemBarcode]);
      cy.visit(TopMenu.requestsPath);
      Requests.waitLoading();
      NewRequest.openNewRequestPane();
      NewRequest.waitLoadingNewRequestPage(true);
      NewRequest.enterHridInfo(testData.instanceHRID);
      NewRequest.enterRequesterInfoWithRequestType(
        {
          requesterBarcode: testData.requester.barcode,
          pickupServicePoint: testData.servicePoint.name,
        },
        REQUEST_TYPES.RECALL,
      );
      NewRequest.verifyRequestInformation(REQUEST_TYPES.HOLD);
      NewRequest.saveRequestAndClose();
      NewRequest.waitLoading();
      cy.wrap(instanceLinkText).as('instanceTitle');
      RequestDetail.checkItemBarcode(testData.requester.barcode);
      RequestDetail.checkRequestsCount('1');

      cy.visit(TopMenu.circulationLogPath);
      SearchPane.waitLoading();
      SearchPane.searchByItemBarcode(firstItemBarcode);
      SearchPane.checkResultSearch({
        itemBarcode: firstItemBarcode,
        circAction: 'Recall requested',
      });

      cy.visit(TopMenu.requestsPath);
      Requests.waitLoading();

      cy.get('@instanceTitle').then((title) => {
        cy.visit(TopMenu.requestsPath);
        Requests.waitLoading();
        EditRequest.findAndOpenCreatedRequest({ instanceTitle: title });
        EditRequest.editPickupServicePoint();
        InteractorsTools.checkCalloutMessage(
          'Request has been successfully edited for Admin, acq-admin',
        );

        RequestDetail.openItemByBarcode(firstItemBarcode);
        cy.wait(100000);
      });
      // TODO complete test and after hook
    },
  );
});
