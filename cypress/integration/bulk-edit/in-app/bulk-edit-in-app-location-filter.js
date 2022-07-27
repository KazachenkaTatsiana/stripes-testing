import TopMenu from '../../../support/fragments/topMenu';
import testTypes from '../../../support/dictionary/testTypes';
import permissions from '../../../support/dictionary/permissions';
import BulkEditSearchPane from '../../../support/fragments/bulk-edit/bulk-edit-search-pane';
import devTeams from '../../../support/dictionary/devTeams';
import InventoryInstances from '../../../support/fragments/inventory/inventoryInstances';
import getRandomPostfix from '../../../support/utils/stringTools';
import FileManager from '../../../support/utils/fileManager';
import Users from '../../../support/fragments/users/users';
import BulkEditActions from '../../../support/fragments/bulk-edit/bulk-edit-actions';

let user;
const item = {
  instanceName: `testBulkEdit_${getRandomPostfix()}`,
  itemBarcode: getRandomPostfix(),
};
const validItemBarcodesFileName = `validItemBarcodes_${getRandomPostfix()}.csv`;

describe('bulk-edit', { retries: 3 }, () => {
  before('create user', () => {
    cy.createTempUser([
      permissions.bulkEditView.gui,
      permissions.bulkEditEdit.gui,
    ])
      .then(userProperties => {
        user = userProperties;
        cy.login(user.username, user.password, { path: TopMenu.bulkEditPath, waiter: BulkEditSearchPane.waitLoading });

        InventoryInstances.createInstanceViaApi(item.instanceName, item.itemBarcode);
        FileManager.createFile(`cypress/fixtures/${validItemBarcodesFileName}`, item.itemBarcode);
      });
  });

  after('delete test data', () => {
    InventoryInstances.deleteInstanceAndHoldingRecordAndAllItemsViaApi(item.itemBarcode);
    Users.deleteViaApi(user.userId);
    FileManager.deleteFile(`cypress/fixtures/${validItemBarcodesFileName}`);
  });

  it('C357053 Negative: Verify enable type ahead in location look-up (firebird)', { tags: [testTypes.smoke, devTeams.firebird] }, () => {
    BulkEditSearchPane.selectRecordIdentifier('Item barcode');

    BulkEditSearchPane.uploadFile(validItemBarcodesFileName);
    BulkEditSearchPane.waitFileUploading();

    BulkEditActions.openActions();
    BulkEditActions.openStartBulkEditForm();

    BulkEditActions.fillTemporaryLocationFilter(`test_location_${getRandomPostfix()}`);
    BulkEditActions.verifyNoMatchingOptionsForLocationFilter();

    BulkEditActions.cancel();
    BulkEditActions.newBulkEdit();
  });

  it('C356787 Verify enable type ahead in location look-up (firebird)', { tags: [testTypes.smoke, devTeams.firebird] }, () => {
    BulkEditSearchPane.selectRecordIdentifier('Item barcode');

    BulkEditSearchPane.uploadFile(validItemBarcodesFileName);
    BulkEditSearchPane.waitFileUploading();

    BulkEditActions.openActions();
    BulkEditActions.openStartBulkEditForm();

    const location = 'Annex';
    BulkEditActions.fillTemporaryLocationFilter(location);
    BulkEditActions.verifyMatchingOptionsForLocationFilter(location);

    BulkEditActions.cancel();
    BulkEditActions.newBulkEdit();
  });
});