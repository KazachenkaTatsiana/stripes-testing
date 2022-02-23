import TopMenu from '../../../support/fragments/topMenu';
import RemoteStorageHelper from '../../../support/fragments/settings/remote-storage/remote-storage-configuration';
import getRandomPostfix from '../../../support/utils/stringTools';
import TestTypes from '../../../support/dictionary/testTypes';

describe('navigate to remote storage configuration', () => {
  beforeEach('login', () => {
    // TODO: need to clarify about permissions at FAT-1196
    cy.login(Cypress.env('diku_login'), Cypress.env('diku_password'));
    cy.visit(TopMenu.remoteStorageConfigurationPath);
  });

  // parametrized providers
  [
    RemoteStorageHelper.configurations.CaiaSoft,
    RemoteStorageHelper.configurations.DematicEMS,
    RemoteStorageHelper.configurations.DematicStagingDirector
  ].forEach(configuration => {
    it('C163919 configure remote storage', { tags: [TestTypes.smoke] }, () => {
      const name = `AutotestConfigurationName${getRandomPostfix()}`;

      configuration.create(name);
      RemoteStorageHelper.verifyCreatedConfiguration(name, configuration);
      RemoteStorageHelper.editConfiguration(name, { nameInput: 'newAutotestConfigurationName' });
      RemoteStorageHelper.closeWithoutSaving();
      RemoteStorageHelper.verifyCreatedConfiguration(name, configuration);
      RemoteStorageHelper.deleteRemoteStorage(name);
    });
  });
});