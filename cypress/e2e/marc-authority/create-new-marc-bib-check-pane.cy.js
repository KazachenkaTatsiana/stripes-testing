import { DevTeams, Permissions, TestTypes } from '../../support/dictionary';
import TopMenu from '../../support/fragments/topMenu';
import Users from '../../support/fragments/users/users';
import InventoryInstances from '../../support/fragments/inventory/inventoryInstances';
import InventoryInstance from '../../support/fragments/inventory/inventoryInstance';
import QuickMarcEditor from '../../support/fragments/quickMarcEditor';

describe('Create new MARC bib', () => {
  const testData = {};

  before('Create test data', () => {
    cy.createTempUser([
      Permissions.inventoryAll.gui,
      Permissions.uiQuickMarcQuickMarcBibliographicEditorCreate.gui,
    ]).then((userProperties) => {
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
    'C380427 A new "MARC bib" record is opened in QuickMARC UI (spitfire) (TaaS)',
    {
      tags: [TestTypes.criticalPath, DevTeams.spitfire],
    },
    () => {
      // Open "Inventory" app
      InventoryInstances.waitContentLoading();
      // Click on "Actions" button in second pane
      // Click on "+New MARC Bib Record" option in expanded "Actions" menu
      InventoryInstance.newMarcBibRecord();
      // Verify certain fields pre-populated with default values
      QuickMarcEditor.checkDefaultContent();
      // Close the pane with title "Create a new MARC bib record" by clicking on "x" icon in the upper left corner.
      QuickMarcEditor.closeUsingCrossButton();
      InventoryInstances.waitContentLoading();
      // Repeat steps 2-3.
      InventoryInstance.newMarcBibRecord();
      // Click on the "Cancel" button.
      QuickMarcEditor.closeWithoutSaving();
      InventoryInstances.waitContentLoading();
    },
  );
});
