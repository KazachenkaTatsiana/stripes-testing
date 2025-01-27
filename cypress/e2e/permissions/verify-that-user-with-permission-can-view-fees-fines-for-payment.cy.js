import uuid from 'uuid';
import TestTypes from '../../support/dictionary/testTypes';
import devTeams from '../../support/dictionary/devTeams';
import permissions from '../../support/dictionary/permissions';
import UserEdit from '../../support/fragments/users/userEdit';
import TopMenu from '../../support/fragments/topMenu';
import generateItemBarcode from '../../support/utils/generateItemBarcode';
import InventoryInstances from '../../support/fragments/inventory/inventoryInstances';
import PatronGroups from '../../support/fragments/settings/users/patronGroups';
import Location from '../../support/fragments/settings/tenant/locations/newLocation';
import Users from '../../support/fragments/users/users';
import CirculationRules from '../../support/fragments/circulation/circulation-rules';
import CheckInActions from '../../support/fragments/check-in-actions/checkInActions';
import CheckOutActions from '../../support/fragments/check-out-actions/check-out-actions';
import Checkout from '../../support/fragments/checkout/checkout';
import ServicePoints from '../../support/fragments/settings/tenant/servicePoints/servicePoints';
import { getTestEntityValue } from '../../support/utils/stringTools';
import UsersOwners from '../../support/fragments/settings/users/usersOwners';
import PaymentMethods from '../../support/fragments/settings/users/paymentMethods';
import LoanPolicy from '../../support/fragments/circulation/loan-policy';
import UsersSearchPane from '../../support/fragments/users/usersSearchPane';
import UsersCard from '../../support/fragments/users/usersCard';
import UserAllFeesFines from '../../support/fragments/users/userAllFeesFines';
import { ITEM_STATUS_NAMES } from '../../support/constants';
import LostItemFeePolicy from '../../support/fragments/circulation/lost-item-fee-policy';
import LoanDetails from '../../support/fragments/users/userDefaultObjects/loanDetails';
import FeeFineDetails from '../../support/fragments/users/feeFineDetails';
import NewFeeFine from '../../support/fragments/users/newFeeFine';

describe('Permissions --> Users', () => {
  let userData;
  const instanceData = {
    itemBarcode: generateItemBarcode(),
    title: getTestEntityValue('InstancePermission'),
  };
  const testData = {
    userServicePoint: ServicePoints.getDefaultServicePointWithPickUpLocation(),
    patronGroup: {
      name: getTestEntityValue('groupToTestPermission'),
    },
    ruleProps: {},
  };
  const lostItemFeePolicyBody = {
    name: getTestEntityValue('1_hour_test'),
    itemAgedLostOverdue: {
      duration: 1,
      intervalId: 'Hours',
    },
    patronBilledAfterAgedLost: {
      duration: 1,
      intervalId: 'Hours',
    },
    chargeAmountItem: {
      chargeType: 'anotherCost',
      amount: '10.00',
    },
    lostItemProcessingFee: '10.00',
    chargeAmountItemPatron: true,
    chargeAmountItemSystem: true,
    lostItemChargeFeeFine: {
      duration: 1,
      intervalId: 'Hours',
    },
    returnedLostItemProcessingFee: false,
    replacedLostItemProcessingFee: false,
    replacementProcessingFee: '0.00',
    replacementAllowed: false,
    lostItemReturned: 'Charge',
    id: uuid(),
  };
  const loanPolicyBody = {
    id: uuid(),
    name: getTestEntityValue('1_hour'),
    loanable: true,
    loansPolicy: {
      closedLibraryDueDateManagementId: 'CURRENT_DUE_DATE_TIME',
      period: {
        duration: 1,
        intervalId: 'Hours',
      },
      profileId: 'Rolling',
    },
    renewable: true,
    renewalsPolicy: {
      unlimited: false,
      numberAllowed: 2,
      renewFromId: 'SYSTEM_DATE',
    },
  };
  const ownerBody = {
    id: uuid(),
    owner: getTestEntityValue('AutotestOwner'),
    servicePointOwner: [
      {
        value: testData.userServicePoint.id,
        label: testData.userServicePoint.name,
      },
    ],
  };

  before('Preconditions', () => {
    cy.getAdminToken()
      .then(() => {
        ServicePoints.createViaApi(testData.userServicePoint);
        testData.defaultLocation = Location.getDefaultLocation(testData.userServicePoint.id);
        Location.createViaApi(testData.defaultLocation);
        cy.getInstanceTypes({ limit: 1 }).then((instanceTypes) => {
          testData.instanceTypeId = instanceTypes[0].id;
        });
        cy.getHoldingTypes({ limit: 1 }).then((holdingTypes) => {
          testData.holdingTypeId = holdingTypes[0].id;
        });
        cy.createLoanType({
          name: getTestEntityValue('loanType'),
        }).then((loanType) => {
          testData.loanTypeId = loanType.id;
        });
        cy.getMaterialTypes({ limit: 1 }).then((materialTypes) => {
          testData.materialTypeId = materialTypes.id;
        });
      })
      .then(() => {
        InventoryInstances.createFolioInstanceViaApi({
          instance: {
            instanceTypeId: testData.instanceTypeId,
            title: instanceData.title,
          },
          holdings: [
            {
              holdingsTypeId: testData.holdingTypeId,
              permanentLocationId: testData.defaultLocation.id,
            },
          ],
          items: [
            {
              barcode: instanceData.itemBarcode,
              status: { name: ITEM_STATUS_NAMES.AVAILABLE },
              permanentLoanType: { id: testData.loanTypeId },
              materialType: { id: testData.materialTypeId },
            },
          ],
        }).then((specialInstanceIds) => {
          instanceData.instanceId = specialInstanceIds.instanceId;
          instanceData.holdingId = specialInstanceIds.holdingIds[0].id;
          instanceData.itemId = specialInstanceIds.holdingIds[0].itemIds;
        });
      });

    UsersOwners.createViaApi(ownerBody).then(() => {
      PaymentMethods.createViaApi(ownerBody.id).then((paymentMethod) => {
        testData.paymentMethodId = paymentMethod.id;
        testData.paymentMethodName = paymentMethod.name;
      });
    });
    LostItemFeePolicy.createViaApi(lostItemFeePolicyBody);
    LoanPolicy.createViaApi(loanPolicyBody);
    CirculationRules.getViaApi().then((circulationRule) => {
      testData.originalCirculationRules = circulationRule.rulesAsText;
      const ruleProps = CirculationRules.getRuleProps(circulationRule.rulesAsText);
      ruleProps.l = loanPolicyBody.id;
      ruleProps.i = lostItemFeePolicyBody.id;
      testData.addedCirculationRule =
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
        testData.originalCirculationRules,
        ruleProps,
        't ',
        testData.loanTypeId,
      );
    });

    PatronGroups.createViaApi(testData.patronGroup.name).then((res) => {
      testData.patronGroup.id = res;
      cy.createTempUser(
        [
          permissions.uiFeeFinesActions.gui,
          permissions.uiUsersManualPay.gui,
          permissions.uiUsersfeefinesCRUD.gui,
          permissions.uiUsersfeefinesView.gui,
          permissions.uiUsersDeclareItemLost.gui,
          permissions.loansView.gui,
        ],
        testData.patronGroup.name,
      ).then((userProperties) => {
        userData = userProperties;
        UserEdit.addServicePointViaApi(
          testData.userServicePoint.id,
          userData.userId,
          testData.userServicePoint.id,
        );
        cy.loginAsAdmin({
          path: TopMenu.checkOutPath,
          waiter: Checkout.waitLoading,
        });
      });
    });
  });

  after('Deleting created entities', () => {
    NewFeeFine.getUserFeesFines(userData.userId).then((userFeesFines) => {
      cy.wrap(userFeesFines.accounts).each(({ id }) => {
        NewFeeFine.deleteFeeFineAccountViaApi(id);
      });
    });
    CheckInActions.checkinItemViaApi({
      itemBarcode: instanceData.itemBarcode,
      servicePointId: testData.userServicePoint.id,
      checkInDate: new Date().toISOString(),
    });
    CirculationRules.deleteRuleViaApi(testData.addedCirculationRule);
    cy.deleteLoanPolicy(loanPolicyBody.id);
    LostItemFeePolicy.deleteViaApi(lostItemFeePolicyBody.id);
    UserEdit.changeServicePointPreferenceViaApi(userData.userId, [testData.userServicePoint.id]);
    ServicePoints.deleteViaApi(testData.userServicePoint.id);
    Users.deleteViaApi(userData.userId);
    PatronGroups.deleteViaApi(testData.patronGroup.id);
    InventoryInstances.deleteInstanceAndHoldingRecordAndAllItemsViaApi(instanceData.itemBarcode);
    PaymentMethods.deleteViaApi(testData.paymentMethodId);
    UsersOwners.deleteViaApi(ownerBody.id);
    Location.deleteViaApiIncludingInstitutionCampusLibrary(
      testData.defaultLocation.institutionId,
      testData.defaultLocation.campusId,
      testData.defaultLocation.libraryId,
      testData.defaultLocation.id,
    );
    cy.deleteLoanType(testData.loanTypeId);
  });

  it(
    'C380503 Verify that user with permission can view fees/fines for payment (vega) (TaaS)',
    { tags: [TestTypes.extendedPath, devTeams.vega] },
    () => {
      CheckOutActions.checkOutUser(userData.barcode);
      CheckOutActions.checkOutItem(instanceData.itemBarcode);
      Checkout.verifyResultsInTheRow([instanceData.itemBarcode]);
      CheckOutActions.openLoanDetails();
      LoanDetails.startDeclareLost();
      LoanDetails.finishDeclareLost(getTestEntityValue('declareLostComment'));
      LoanDetails.checkStatusDeclaredLost();

      cy.login(userData.username, userData.password, {
        path: TopMenu.usersPath,
        waiter: UsersSearchPane.waitLoading,
      });
      UsersSearchPane.searchByKeywords(userData.username);
      UsersSearchPane.selectUserFromList(userData.username);
      UsersCard.waitLoading();
      UsersCard.openFeeFines();
      UsersCard.showOpenedFeeFines();
      UserAllFeesFines.clickOnRowByIndex(0);
      FeeFineDetails.waitLoading();
    },
  );
});
