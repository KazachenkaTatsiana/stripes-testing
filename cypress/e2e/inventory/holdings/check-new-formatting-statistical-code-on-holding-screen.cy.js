import { including } from '@interactors/html';
import { randomFourDigitNumber } from '../../../support/utils/stringTools';
import { DevTeams, Permissions, TestTypes } from '../../../support/dictionary';
import InventoryInstances from '../../../support/fragments/inventory/inventoryInstances';
import Users from '../../../support/fragments/users/users';
import InventorySearchAndFilter from '../../../support/fragments/inventory/inventorySearchAndFilter';
import InventoryInstance from '../../../support/fragments/inventory/inventoryInstance';
import HoldingsRecordEdit from '../../../support/fragments/inventory/holdingsRecordEdit';
import TopMenu from '../../../support/fragments/topMenu';
import HoldingsRecordView from '../../../support/fragments/inventory/holdingsRecordView';
import { LOCATION_NAMES } from '../../../support/constants';

const testData = {
  user: {},
  item: {
    instanceName: `Inventory Instance ${randomFourDigitNumber()}`,
    itemBarcode: randomFourDigitNumber(),
  },
  statisticalCode: 'Book, print (books)',
  secondStatisticalCode: 'Books, electronic (ebooks)',
  calloutMessage: 'has been successfully saved.',
};

describe('Inventory', () => {
  describe('Holdings', () => {
    before('Create test data', () => {
      cy.createTempUser([Permissions.inventoryAll.gui]).then((userProperties) => {
        testData.user = userProperties;
        cy.getAdminToken()
          .then(() => {
            cy.getInstanceTypes({ limit: 1 });
            cy.getInstanceIdentifierTypes({ limit: 1 });
          })
          .then(() => {
            cy.createInstance({
              instance: {
                instanceTypeId: Cypress.env('instanceTypes')[0].id,
                title: testData.item.instanceName,
              },
            }).then((specialInstanceId) => {
              testData.item.instanceId = specialInstanceId;
            });
          });

        cy.login(testData.user.username, testData.user.password, {
          path: TopMenu.inventoryPath,
          waiter: InventoryInstances.waitContentLoading,
        });
      });
    });

    after('Delete test data', () => {
      cy.getHoldings({
        limit: 1,
        query: `"instanceId"="${testData.item.instanceId}"`,
      })
        .then((holdings) => {
          testData.item.holdingUUID = holdings[0].id;
        })
        .then(() => {
          cy.deleteHoldingRecordViaApi(testData.item.holdingUUID);
        });
      InventoryInstance.deleteInstanceViaApi(testData.item.instanceId);
      Users.deleteViaApi(testData.user.userId);
    });

    it(
      'C400653 Check the new formatting of Statistical codes field on Holdings create/edit screen (folijet) (TaaS)',
      { tags: [TestTypes.extendedPath, DevTeams.folijet] },
      () => {
        InventoryInstance.searchByTitle(testData.item.instanceName);
        InventorySearchAndFilter.verifyInstanceDisplayed(testData.item.instanceName);
        InventorySearchAndFilter.checkRowsCount(1);
        InventoryInstances.selectInstance();
        InventoryInstance.waitLoading();

        InventoryInstance.pressAddHoldingsButton();
        HoldingsRecordEdit.waitLoading();

        HoldingsRecordEdit.clickAddStatisticalCode();

        HoldingsRecordEdit.openStatisticalCodeDropdown();
        HoldingsRecordEdit.verifyStatisticalCodeCount(1, false);
        HoldingsRecordEdit.closeStatisticalCodeDropdown();

        HoldingsRecordEdit.openStatisticalCodeDropdown();
        HoldingsRecordEdit.filterStatisticalCodeByName(testData.statisticalCode);
        HoldingsRecordEdit.verifyStatisticalCodeCount(1);

        HoldingsRecordEdit.chooseStatisticalCode(testData.statisticalCode);
        HoldingsRecordEdit.checkErrorMessageForStatisticalCode(false);

        HoldingsRecordEdit.changePermanentLocation(LOCATION_NAMES.ANNEX);
        HoldingsRecordEdit.saveAndClose();
        InventoryInstance.waitLoading();
        InventoryInstance.checkCalloutMessage(including(testData.calloutMessage));
        InventoryInstance.checkIsHoldingsCreated([`${LOCATION_NAMES.ANNEX_UI} >`]);

        InventoryInstance.openHoldingView();
        HoldingsRecordView.edit();
        HoldingsRecordEdit.waitLoading();

        HoldingsRecordEdit.openStatisticalCodeDropdown();
        HoldingsRecordEdit.verifyStatisticalCodeCount(1, false);
        HoldingsRecordEdit.closeStatisticalCodeDropdown();
        HoldingsRecordEdit.openStatisticalCodeDropdown();
        HoldingsRecordEdit.filterStatisticalCodeByName(testData.secondStatisticalCode);
        HoldingsRecordEdit.verifyStatisticalCodeCount(1);
        HoldingsRecordEdit.chooseStatisticalCode(testData.secondStatisticalCode);
        HoldingsRecordEdit.checkErrorMessageForStatisticalCode(false);
      },
    );
  });
});