import uuid from 'uuid';
import testTypes from '../../support/dictionary/testTypes';
import devTeams from '../../support/dictionary/devTeams';
import permissions from '../../support/dictionary/permissions';
import { ITEM_STATUS_NAMES, REQUEST_TYPES } from '../../support/constants';
import UserEdit from '../../support/fragments/users/userEdit';
import TopMenu from '../../support/fragments/topMenu';
import InventoryInstances from '../../support/fragments/inventory/inventoryInstances';
import PatronGroups from '../../support/fragments/settings/users/patronGroups';
import Location from '../../support/fragments/settings/tenant/locations/newLocation';
import Users from '../../support/fragments/users/users';
import CirculationRules from '../../support/fragments/circulation/circulation-rules';
import ServicePoints from '../../support/fragments/settings/tenant/servicePoints/servicePoints';
import getRandomPostfix, { getTestEntityValue } from '../../support/utils/stringTools';
import NewRequest from '../../support/fragments/requests/newRequest';
import RequestPolicy from '../../support/fragments/circulation/request-policy';
import SettingsMenu from '../../support/fragments/settingsMenu';
import TitleLevelRequests from '../../support/fragments/settings/circulation/titleLevelRequests';
import Requests from '../../support/fragments/requests/requests';
import Checkout from '../../support/fragments/checkout/checkout';
import CheckInActions from '../../support/fragments/check-in-actions/checkInActions';
import RequestDetail from '../../support/fragments/requests/requestDetail';
import generateUniqueItemBarcodeWithShift from '../../support/utils/generateUniqueItemBarcodeWithShift';
import ConfirmItemInModal from '../../support/fragments/check-in-actions/confirmItemInModal';
import CheckOutActions from '../../support/fragments/check-out-actions/check-out-actions';

describe('Title level Request', () => {
  let addedCirculationRule;
  let originalCirculationRules;
  const users = [];
  const instanceData = {
    title: getTestEntityValue('Instance'),
    item1Barcode: `1item${generateUniqueItemBarcodeWithShift()}`,
    item2Barcode: `2item${generateUniqueItemBarcodeWithShift()}`,
  };
  const testData = {
    userServicePoint: ServicePoints.getDefaultServicePointWithPickUpLocation(),
    patronGroup: {
      name: getTestEntityValue('groupToTLR'),
    },
  };
  const requestPolicyBody = {
    requestTypes: [REQUEST_TYPES.PAGE, REQUEST_TYPES.HOLD],
    name: `requestPolicy${getRandomPostfix()}`,
    id: uuid(),
  };

  const createTLR = (user, requestType, itemStatus) => {
    cy.visit(TopMenu.requestsPath);
    Requests.waitLoading();
    NewRequest.openNewRequestPane();
    NewRequest.waitLoadingNewRequestPage(true);
    NewRequest.enterHridInfo(instanceData.instanceHRID);
    NewRequest.verifyHridInformation([instanceData.title]);
    NewRequest.enterRequesterInfoWithRequestType(
      {
        requesterBarcode: user.barcode,
        pickupServicePoint: testData.userServicePoint.name,
      },
      requestType,
    );
    NewRequest.verifyRequestInformation(requestType);
    NewRequest.saveRequestAndClose();
    NewRequest.verifyRequestSuccessfullyCreated(user.username);
    RequestDetail.checkItemStatus(itemStatus);
  };

  before('Preconditions', () => {
    cy.getAdminToken()
      .then(() => {
        cy.loginAsAdmin({
          path: SettingsMenu.circulationTitleLevelRequestsPath,
          waiter: TitleLevelRequests.waitLoading,
        });
        ServicePoints.createViaApi(testData.userServicePoint);
        testData.defaultLocation = Location.getDefaultLocation(testData.userServicePoint.id);
        Location.createViaApi(testData.defaultLocation);
        cy.getInstanceTypes({ limit: 1 }).then((instanceTypes) => {
          instanceData.instanceTypeId = instanceTypes[0].id;
        });
        cy.getHoldingTypes({ limit: 1 }).then((holdingTypes) => {
          instanceData.holdingTypeId = holdingTypes[0].id;
        });
        cy.createLoanType({
          name: getTestEntityValue('loanType'),
        }).then((loanType) => {
          instanceData.loanTypeId = loanType.id;
        });
        cy.getMaterialTypes({ limit: 1 }).then((materialTypes) => {
          instanceData.materialTypeId = materialTypes.id;
        });
      })
      .then(() => {
        InventoryInstances.createFolioInstanceViaApi({
          instance: {
            instanceTypeId: instanceData.instanceTypeId,
            title: instanceData.title,
          },
          holdings: [
            {
              holdingsTypeId: instanceData.holdingTypeId,
              permanentLocationId: testData.defaultLocation.id,
            },
          ],
          items: [
            {
              barcode: instanceData.item1Barcode,
              status: { name: ITEM_STATUS_NAMES.AVAILABLE },
              permanentLoanType: { id: instanceData.loanTypeId },
              materialType: { id: instanceData.materialTypeId },
            },
            {
              barcode: instanceData.item2Barcode,
              status: { name: ITEM_STATUS_NAMES.AVAILABLE },
              permanentLoanType: { id: instanceData.loanTypeId },
              materialType: { id: instanceData.materialTypeId },
            },
          ],
        }).then((specialInstanceIds) => {
          instanceData.instanceId = specialInstanceIds.instanceId;
        });
      });
    RequestPolicy.createViaApi(requestPolicyBody);
    CirculationRules.getViaApi().then((circulationRule) => {
      originalCirculationRules = circulationRule.rulesAsText;
      const ruleProps = CirculationRules.getRuleProps(circulationRule.rulesAsText);
      ruleProps.r = requestPolicyBody.id;
      addedCirculationRule =
        't ' +
        testData.loanTypeId +
        ': i ' +
        ruleProps.i +
        ' l ' +
        ruleProps.l +
        ' r ' +
        ruleProps.r +
        ' o ' +
        ruleProps.o +
        ' n ' +
        ruleProps.n;
      CirculationRules.addRuleViaApi(
        originalCirculationRules,
        ruleProps,
        't ',
        testData.loanTypeId,
      );
    });
    PatronGroups.createViaApi(testData.patronGroup.name)
      .then((patronGroupResponse) => {
        testData.patronGroup.id = patronGroupResponse;
      })
      .then(() => {
        for (let i = 0; i < 5; i++) {
          cy.createTempUser([], testData.patronGroup.name).then((userPatronProperties) => {
            users.push(userPatronProperties);
            UserEdit.addServicePointViaApi(
              testData.userServicePoint.id,
              userPatronProperties.userId,
              testData.userServicePoint.id,
            );
          });
        }
      })
      .then(() => {
        cy.createTempUser(
          [
            permissions.requestsAll.gui,
            permissions.checkinAll.gui,
            permissions.checkoutAll.gui,
            permissions.inventoryAll.gui,
            permissions.uiUsersView.gui,
          ],
          testData.patronGroup.name,
        ).then((userPropertiesForMainUser) => {
          users.unshift(userPropertiesForMainUser);
          UserEdit.addServicePointViaApi(
            testData.userServicePoint.id,
            userPropertiesForMainUser.userId,
            testData.userServicePoint.id,
          );
        });
      })
      .then(() => {
        TitleLevelRequests.changeTitleLevelRequestsStatus('allow');
        cy.getInstance({
          limit: 1,
          expandAll: true,
          query: `"id"=="${instanceData.instanceId}"`,
        }).then((instance) => {
          instanceData.instanceHRID = instance.hrid;
        });
      })
      .then(() => {
        cy.login(users[0].username, users[0].password, {
          path: TopMenu.requestsPath,
          waiter: Requests.waitLoading,
        });
      });
  });

  after('Deleting created entities', () => {
    cy.loginAsAdmin({
      path: SettingsMenu.circulationTitleLevelRequestsPath,
      waiter: TitleLevelRequests.waitLoading,
    });
    Requests.getRequestApi({ query: `(instance.title=="${instanceData.title}")` }).then(
      (requestResponse) => {
        cy.log(requestResponse);
        requestResponse.forEach((request) => {
          Requests.deleteRequestViaApi(request.id);
        });
      },
    );
    CheckInActions.checkinItemViaApi({
      itemBarcode: instanceData.item1Barcode,
      servicePointId: testData.userServicePoint.id,
      checkInDate: new Date().toISOString(),
    });
    InventoryInstances.deleteInstanceAndHoldingRecordAndAllItemsViaApi(instanceData.item1Barcode);
    RequestPolicy.deleteViaApi(requestPolicyBody.id);
    CirculationRules.deleteRuleViaApi(addedCirculationRule);
    users.forEach((user) => {
      UserEdit.changeServicePointPreferenceViaApi(user.userId, [testData.userServicePoint.id]);
      Users.deleteViaApi(user.userId);
    });
    ServicePoints.deleteViaApi(testData.userServicePoint.id);
    PatronGroups.deleteViaApi(testData.patronGroup.id);
    cy.deleteLoanType(instanceData.loanTypeId);
    Location.deleteViaApiIncludingInstitutionCampusLibrary(
      testData.defaultLocation.institutionId,
      testData.defaultLocation.campusId,
      testData.defaultLocation.libraryId,
      testData.defaultLocation.id,
    );
    TitleLevelRequests.changeTitleLevelRequestsStatus('forbid');
  });
  it(
    'C380488 Verify that user can create TLR: Recall request for instance with item statuses "Awaiting pickup" and "Checked out" (vega)',
    { tags: [testTypes.criticalPath, devTeams.vega] },
    () => {
      createTLR(users[1], REQUEST_TYPES.PAGE, ITEM_STATUS_NAMES.PAGED);

      cy.visit(TopMenu.checkInPath);
      CheckInActions.waitLoading();
      CheckInActions.checkInItemGui(instanceData.item1Barcode);
      ConfirmItemInModal.confirmAvaitingPickUpModal();

      cy.visit(TopMenu.checkOutPath);
      Checkout.waitLoading();
      CheckOutActions.checkOutUser(users[2].barcode);
      CheckOutActions.checkOutItem(instanceData.item2Barcode);
      CheckOutActions.checkItemInfo(instanceData.item2Barcode, instanceData.title);

      createTLR(users[3], REQUEST_TYPES.RECALL, ITEM_STATUS_NAMES.CHECKED_OUT);

      cy.visit(TopMenu.checkOutPath);
      Checkout.waitLoading();
      CheckOutActions.checkOutUser(users[1].barcode);
      CheckOutActions.checkOutItem(instanceData.item1Barcode);
      CheckOutActions.checkItemInfo(instanceData.item1Barcode, instanceData.title);

      cy.visit(TopMenu.checkInPath);
      CheckInActions.waitLoading();
      CheckInActions.checkInItemGui(instanceData.item2Barcode);
      ConfirmItemInModal.confirmAvaitingPickUpModal();

      createTLR(users[4], REQUEST_TYPES.RECALL, ITEM_STATUS_NAMES.CHECKED_OUT);
      createTLR(users[5], REQUEST_TYPES.RECALL, ITEM_STATUS_NAMES.CHECKED_OUT);
    },
  );
});
