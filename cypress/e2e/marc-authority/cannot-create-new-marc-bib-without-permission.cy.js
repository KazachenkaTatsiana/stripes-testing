import { DevTeams, Permissions, TestTypes } from '../../support/dictionary';
import TopMenu from '../../support/fragments/topMenu';
import Users from '../../support/fragments/users/users';
import InventoryInstances from '../../support/fragments/inventory/inventoryInstances';
import InventoryInstance from '../../support/fragments/inventory/inventoryInstance';

describe('Create new MARC bib', () => {
  const testData = {};

  before('Create test data', () => {
    cy.createTempUser([Permissions.inventoryAll.gui]).then((userProperties) => {
      testData.user = userProperties;

      cy.login(testData.user.username, testData.user.password, {
        path: TopMenu.inventoryPath,
        waiter: InventoryInstances.waitContentLoading,
      });
    });
  });

  after('Delete test data', () => {
    Users.deleteViaApi(testData.user.userId);
  });

  it(
    'C380428 User cannot create new "MARC bib" record without "quickMARC: Create a new MARC bibliographic record" permission (spitfire) (TaaS)',
    {
      tags: [TestTypes.criticalPath, DevTeams.spitfire],
    },
    () => {
      // Open "Inventory" app
      InventoryInstances.waitContentLoading();
      // Click on "Actions" button in second pane
      // Expanded menu does NOT include following option:
      // "+New MARC Bib Record"
      InventoryInstance.checkAbsenceOfNewMarcBibRecordOption();
    },
  );
});
