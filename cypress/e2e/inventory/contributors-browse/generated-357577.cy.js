import { DevTeams, TestTypes, Permissions } from '../../../support/dictionary';
import { INSTANCE_SOURCE_NAMES, LOCATION_NAMES } from '../../../support/constants';
import { Locations, ServicePoints } from '../../../support/fragments/settings/tenant';
import { randomFourDigitNumber } from '../../../support/utils/stringTools';
import TopMenu from '../../../support/fragments/topMenu';
import InventoryInstance from '../../../support/fragments/inventory/inventoryInstance';
import InventoryInstances from '../../../support/fragments/inventory/inventoryInstances';
import Users from '../../../support/fragments/users/users';

describe('Inventory', () => {
  describe('Contributors Browse', () => {
    const testData = {
      servicePoint: ServicePoints.getDefaultServicePoint(),
      instance: {},
      locations: [],
      holdings: [],
      items: [],
    };

    before('Create test data', () => {
      /*
       * Authorized user with "Inventory: View instances, holdings, and items" permission.
       * The system must contain valid "Instance" records filled with "Contributors" information that are stored in the "Instance" records ("Contributors" accordion).
       * User is on the main page of "Inventory" app.
       * The "Instance" tab at toggle is selected.
       */

      cy.getAdminToken().then(() => {
        ServicePoints.createViaApi(testData.servicePoint);
        InventoryInstance.createInstanceViaApi().then(({ instanceData }) => {
          testData.instance = instanceData;
        });
      });

      cy.createTempUser([Permissions.uiInventoryViewInstances.gui]).then((userProperties) => {
        testData.user = userProperties;

        cy.login(testData.user.username, testData.user.password, {
          path: TopMenu.inventoryPath,
          waiter: InventoryInstances.waitContentLoading,
        });
      });
    });

    after('Delete test data', () => {
      /* delete all test objects created in precondition if possible */
      Users.deleteViaApi(testData.user.userId);
    });

    it(
      'C357577 Verify that not-exact match placeholder displays fully in the "Contributor" column (spitfire) (TaaS)',
      { tags: [TestTypes.criticalPath, DevTeams.spitfire] },
      () => {
        // #1 Select "Browse" in "Search|Browse" toggle on "Search & Filter" pane.
        // * Browse options dropdown is displayed with "Select a browse option" option selected by default.
        // * The "Browse inventory" pane is displayed.
        // #2 Click on the browse option dropdown and select “Contributors” option from the expanded dropdown.
        // "Name type" accordion button is displayed below "Reset all" button.
        // #3 Fill in the input field at "Search & filter" pane, with the long not-existing contributor name, which will retrieve non-exact match result.
        // [e.g.: "Great Britain, Department for Environment, Food & Rural Affairs."]
        // * The entered value is displaying in the input field.
        // * The "Search" button became clickable.
        // #4 Click on the "Search" button.
        // * At the result list displayed the following placeholder message:
        // ** "<<your request>> would be here".
        // * The placeholder is fully displaying in the "Contributor" column.
        // ![](index.php?/attachments/get/ca4bd31e-1c3e-4aac-a2f3-fffcb27440f2)
        // #5 Make zoom in to 200% and verify that placeholder displayed fully in the "Contributor" column.
        // The placeholder is fully displaying in the "Contributor" column.
        // ![](index.php?/attachments/get/8477bf4f-49f6-47c2-b641-b9d365675627)
        // #6 Make zoom to the previous scale value and verify that placeholder displayed fully in the "Contributor" column.
        // The placeholder is fully displaying in the "Contributor" column.
      },
    );
  });
});
