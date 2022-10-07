import testType from '../../../support/dictionary/testTypes';
import Permissions from '../../../support/dictionary/permissions';
import InventoryInstance from '../../../support/fragments/inventory/inventoryInstance';
import InventorySearch from '../../../support/fragments/inventory/inventorySearch';
import BrowseContributors from '../../../support/fragments/inventory/search/browseContributors';
import TopMenu from '../../../support/fragments/topMenu';
import Users from '../../../support/fragments/users/users';
import devTeams from '../../../support/dictionary/devTeams';

describe('ui-inventory: search', () => {
  const testData = {};
  const instanceA = BrowseContributors.defaultInstanceAWithContributor;
  const instanceZ = BrowseContributors.defaultInstanceZWithContributor;

  beforeEach('Creating user and "Instance" records with contributors', () => {
    cy.getAdminToken();

    cy.getInstanceTypes({ limit: 1 }).then((res) => {
      instanceA.instanceTypeId = res[0].id;
      instanceZ.instanceTypeId = res[0].id;
    });

    BrowseContributors.getContributorNameTypes().then((res) => {
      instanceA.contributors[0].contributorNameTypeId = res.body.contributorNameTypes[0].id;
      instanceA.contributors[0].contributorNameType = res.body.contributorNameTypes[0].name;
      instanceA.contributors[0].contributorTypeText = res.body.contributorNameTypes[0].name;
      instanceZ.contributors[0].contributorNameTypeId = res.body.contributorNameTypes[0].id;
      instanceZ.contributors[0].contributorNameType = res.body.contributorNameTypes[0].name;
      instanceZ.contributors[0].contributorTypeText = res.body.contributorNameTypes[0].name;
    });

    BrowseContributors.createInstanceWithContributorViaApi(instanceA);
    BrowseContributors.createInstanceWithContributorViaApi(instanceZ);

    cy.getInstanceById(instanceA.id)
      .then((res) => {
        testData.instanceAProps = res;
      });
    cy.getInstanceById(instanceZ.id)
      .then((res) => {
        testData.instanceZProps = res;
      });

    cy.createTempUser([
      Permissions.uiInventoryViewInstances.gui,
    ]).then((resUserProperties) => {
      testData.user = resUserProperties;
      cy.login(resUserProperties.username, resUserProperties.password);
      cy.visit(TopMenu.inventoryPath);
    });
  });

  // https://issues.folio.org/browse/UIIN-2199
  it('C353639 Browse contributors with exact match query (spitfire)', { tags: [testType.smoke, devTeams.spitfire] }, () => {
    InventorySearch.verifyKeywordsAsDefault();
    BrowseContributors.checkBrowseOptions();
    BrowseContributors.select();
    BrowseContributors.checkSearch();
    BrowseContributors.browse(instanceA.contributors[0].name);
    BrowseContributors.checkSearchResultsTable();
    BrowseContributors.checkExactSearchResult(instanceA.contributors[0], instanceZ.contributors[0]);
    BrowseContributors.openInstance(instanceA.contributors[0]);
    BrowseContributors.checkInstance(instanceA);
  });

  afterEach('Deleting user', () => {
    Users.deleteViaApi(testData.user.userId);
    InventoryInstance.deleteInstanceViaApi(instanceA.id);
    InventoryInstance.deleteInstanceViaApi(instanceZ.id);
  });
});