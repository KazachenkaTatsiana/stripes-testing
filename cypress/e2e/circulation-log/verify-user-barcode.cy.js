import { DevTeams, Permissions, TestTypes } from '../../support/dictionary';
import TopMenu from '../../support/fragments/topMenu';
import InventoryInstances from '../../support/fragments/inventory/inventoryInstances';
import ServicePoints from '../../support/fragments/settings/tenant/servicePoints/servicePoints';
import { Locations } from '../../support/fragments/settings/tenant/location-setup';
import UserEdit from '../../support/fragments/users/userEdit';
import NewRequest from '../../support/fragments/requests/newRequest';
import SearchPane from '../../support/fragments/circulation-log/searchPane';
import RequestsSearchResultsPane from '../../support/fragments/requests/requestsSearchResultsPane';
import CheckOutActions from '../../support/fragments/check-out-actions/check-out-actions';
import dataExportViewAllLogs from '../../support/fragments/data-export/dataExportViewAllLogs';
import Checkout from '../../support/fragments/checkout/checkout';
import { ITEM_STATUS_NAMES, REQUEST_TYPES } from '../../support/constants';

describe('Circulation log', () => {
  const testData = {
    folioInstances: InventoryInstances.generateFolioInstances(),
    servicePoint: ServicePoints.getDefaultServicePointWithPickUpLocation(),
    requestsId: '',
  };
  let userData;
  before('Create test data', () => {
    cy.getAdminToken();
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
    cy.createTempUser([
      Permissions.circulationLogAll.gui,
      Permissions.checkoutAll.gui,
      Permissions.uiRequestsEdit.gui,
      Permissions.uiRequestsView.gui,
      Permissions.uiRequestsCreate.gui,
    ])
      .then((userProperties) => {
        userData = userProperties;
      })
      .then(() => {
        UserEdit.addServicePointViaApi(
          testData.servicePoint.id,
          userData.userId,
          testData.servicePoint.id,
        );
        cy.login(userData.username, userData.password, {
          path: TopMenu.requestsPath,
          waiter: RequestsSearchResultsPane.waitLoading,
        });
      });
  });

  after('Delete test data', () => {
    UserEdit.changeServicePointPreferenceViaApi(userData.userId, [testData.servicePoint.id]);
    ServicePoints.deleteViaApi(testData.servicePoint.id);
    InventoryInstances.deleteInstanceAndHoldingRecordAndAllItemsViaApi(
      testData.folioInstances[0].barcodes[0],
    );
    Locations.deleteViaApi(testData.defaultLocation);
  });

  it(
    'C360553 Verify that user barcodes shown in request actions (volaris) (TaaS)',
    { tags: [TestTypes.extendedPath, DevTeams.volaris] },
    () => {
      const itemBarcode = testData.folioInstances[0].barcodes[0];
      // Click "Actions" menu => Select "New" button
      cy.log(`userServicePoint  : ${testData.servicePoint.name}`);
      NewRequest.openNewRequestPane();
      // Fill in the "Item barcode" field with valid item barcode with status "Available" => Hit "Enter" button next to the field
      cy.wait(3000);
      NewRequest.enterItemInfo(itemBarcode);
      NewRequest.verifyRequestInformation(ITEM_STATUS_NAMES.AVAILABLE);
      // Go to the "Requester information" accordion=> Fill in the "Requester barcode" field with valid User's barcode  => Hit "Enter" button next to the field
      NewRequest.enterRequesterBarcode(userData.barcode);
      // Specify "Pickup service point" by choosing the same as User's one from the  "Pickup service point" dropdown
      NewRequest.chooseRequestType(REQUEST_TYPES.PAGE);
      NewRequest.choosepickupServicePoint(testData.servicePoint.name);
      // Click "Save & close" button
      NewRequest.saveRequestAndClose();
      // Navigate to the "Check out" app and check out the Item requested (step 6) by pasting the Requester's barcode (step 4) to the input field on the "Scan patron card" pane and the Items barcode to the input field on the "Scan items" pane => Hit "Enter" buttons on each pane
      cy.visit(TopMenu.checkOutPath);
      Checkout.waitLoading();
      cy.wait(2000);
      CheckOutActions.checkOutItemUser(userData.barcode, itemBarcode);
      // Navigate to the "Circulation log" app
      cy.visit(TopMenu.circulationLogPath);
      SearchPane.waitLoading();
      dataExportViewAllLogs.verifySearchAndFilterPane();
      cy.wait(2000);
      // Search for that Item with linked Request
      SearchPane.searchByItemBarcode(itemBarcode);
      // Check the row with "Request" object
      SearchPane.checkUserData('User barcode', userData.barcode, 1);
      SearchPane.checkUserData('Object', 'Request', 1);
    },
  );
});
