import getRandomPostfix from '../../../support/utils/stringTools';
import TestTypes from '../../../support/dictionary/testTypes';
import DevTeams from '../../../support/dictionary/devTeams';
import Permissions from '../../../support/dictionary/permissions';
import TopMenu from '../../../support/fragments/topMenu';
import DataImport from '../../../support/fragments/data_import/dataImport';
import Users from '../../../support/fragments/users/users';
import JobProfiles from '../../../support/fragments/data_import/job_profiles/jobProfiles';
import Logs from '../../../support/fragments/data_import/logs/logs';
import InventoryInstance from '../../../support/fragments/inventory/inventoryInstance';
import InventorySearch from '../../../support/fragments/inventory/inventorySearch'

describe('Search in Inventory', () => {
  const testData = {};
  const jobProfileToRun = 'Default - Create instance and SRS MARC Bib';
  let fileName = `testInventoryFile.${getRandomPostfix()}.mrc`;
  let createdInstanceIDs = [];

  before('Creating data', () => {
    cy.createTempUser([
      Permissions.moduleDataImportEnabled.gui,
      Permissions.inventoryAll.gui,
    ]).then(createdUserProperties => {
      testData.userProperties = createdUserProperties;
    });
  });

  beforeEach('Creating data', () => {
    cy.login(testData.userProperties.username, testData.userProperties.password, { path: TopMenu.dataImportPath, waiter: DataImport.waitLoading });
  });

  afterEach('Deleting data', () => {
    cy.loginAsAdmin({ path: TopMenu.dataImportPath, waiter: DataImport.waitLoading });
    DataImport.selectLog();
    DataImport.openDeleteImportLogsModal();
    DataImport.confirmDeleteImportLogs();
  });

  after('Deleting data', () => {
    Users.deleteViaApi(testData.userProperties.userId);
    createdInstanceIDs.forEach(id => {
      InventoryInstance.deleteInstanceViaApi(id);
    });
  });

  it('C360548 Verify that operator "=" is used when user search for "Instance" by "Contributor" search option. (spitfire)', { tags: [TestTypes.criticalPath, DevTeams.spitfire] }, () => {
    const searchQueries = ['Henri Sauguet', 'Sauguet, Henri, 1901-1989', 'Henri Sauguet 1901-1989'];

    DataImport.uploadFile('Sauguet_Henri_5_Bib_records.mrc', fileName);
    JobProfiles.waitLoadingList();
    JobProfiles.searchJobProfileForImport(jobProfileToRun);
    JobProfiles.runImportFile(fileName);
    Logs.checkStatusOfJobProfile('Completed');
    Logs.openFileDetails(fileName);
    for (let i = 0; i < 5; i++) {
      Logs.getCreatedItemsID(i).then(link => {
        createdInstanceIDs.push(link.split('/')[5]);
      });
    }

    cy.visit(TopMenu.inventoryPath);

    InventorySearch.selectSearchOptions('Contributor', 'Sauguet, Henri');
    InventorySearch.checkContributorRequest();
    InventorySearch.checkContributorsColumResult('Sauguet');
    InventorySearch.checkContributorsColumResult('Henri');
    // The resetAll button is used because the reset search input is very unstable
    InventorySearch.resetAll();

    searchQueries.forEach(query => {
      InventorySearch.selectSearchOptions('Contributor', query);
      InventorySearch.clickSearch();
      InventorySearch.checkContributorsColumResult('Sauguet');
      InventorySearch.checkContributorsColumResult('Henri');
      if (query.includes('1901-1989')) InventorySearch.checkContributorsColumResult('Henri');
      InventorySearch.resetAll();
    });
  });

  it('C360555 Verify that search for "Instance" records by "Keyword" option with "<ISBN with dashes>" query will only return the records with matched identifier value. (spitfire)', { tags: [TestTypes.criticalPath, DevTeams.spitfire] }, () => {
    const searchQueries = ['978-92-8000-565-9', '978-92-8011-565-9'];

    DataImport.uploadFile('two_bib_records_with_isbn_search_by_keyword.mrc', fileName);
    JobProfiles.waitLoadingList();
    JobProfiles.searchJobProfileForImport(jobProfileToRun);
    JobProfiles.runImportFile(fileName);
    Logs.checkStatusOfJobProfile('Completed');
    Logs.openFileDetails(fileName);
    for (let i = 0; i < 2; i++) {
      Logs.getCreatedItemsID(i).then(link => {
        createdInstanceIDs.push(link.split('/')[5]);
      });
    }

    cy.visit(TopMenu.inventoryPath);

    searchQueries.forEach(query => {
      InventorySearch.selectSearchOptions('Keyword (title, contributor, identifier, HRID, UUID)', query);
      InventorySearch.clickSearch();
      InventorySearch.verifySearchResult('"Closer to the truth than any fact" : memoir, memory, and Jim Crow / Jennifer Jensen Wallach.');
      InventorySearch.checkMissingSearchResult('Chopsticks only works in pairs (test) 9');
      InventorySearch.selectSearchResultItem();
      InventoryInstance.checkIdentifier(query);
      InventorySearch.resetAll();
    });
  });
});