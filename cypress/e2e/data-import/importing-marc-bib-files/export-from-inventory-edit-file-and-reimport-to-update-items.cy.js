import getRandomPostfix from '../../../support/utils/stringTools';
import TestTypes from '../../../support/dictionary/testTypes';
import DevTeams from '../../../support/dictionary/devTeams';
import SettingsJobProfiles from '../../../support/fragments/settings/dataImport/settingsJobProfiles';
import TopMenu from '../../../support/fragments/topMenu';
import DataImport from '../../../support/fragments/data_import/dataImport';
import FileDetails from '../../../support/fragments/data_import/logs/fileDetails';
import Logs from '../../../support/fragments/data_import/logs/logs';
import JobProfiles from '../../../support/fragments/data_import/job_profiles/jobProfiles';
import InventorySearchAndFilter from '../../../support/fragments/inventory/inventorySearchAndFilter';
import SettingsMenu from '../../../support/fragments/settingsMenu';
import NewFieldMappingProfile from '../../../support/fragments/data_import/mapping_profiles/newFieldMappingProfile';
import FieldMappingProfiles from '../../../support/fragments/data_import/mapping_profiles/fieldMappingProfiles';
import NewMatchProfile from '../../../support/fragments/data_import/match_profiles/newMatchProfile';
import NewActionProfile from '../../../support/fragments/data_import/action_profiles/newActionProfile';
import NewJobProfile from '../../../support/fragments/data_import/job_profiles/newJobProfile';
import ActionProfiles from '../../../support/fragments/data_import/action_profiles/actionProfiles';
import MatchProfiles from '../../../support/fragments/data_import/match_profiles/matchProfiles';
import InventoryInstance from '../../../support/fragments/inventory/inventoryInstance';
import FileManager from '../../../support/utils/fileManager';
import ExportFile from '../../../support/fragments/data-export/exportFile';
import ItemRecordView from '../../../support/fragments/inventory/itemRecordView';

describe('ui-data-import', () => {
  let instanceHrid;
  const quantityOfItems = '1';
  const instance = {
    instanceTitle: 'Love enough / Dionne Brand.',
    instanceSubject: '35678123678',
    holdingsLocation: 'Main Library >',
    itemStatus: 'Available'
  };
  const permanentLocation = 'Main Library (KU/CC/DI/M)';
  const recordType = 'MARC_BIBLIOGRAPHIC';
  const note = 'Test administrative note for item';
  // unique file name
  const marcFileForCreate = `C11123 autoTestFile.${getRandomPostfix()}.mrc`;
  const nameForCSVFile = `C11123 autotestFile${getRandomPostfix()}.csv`;
  const nameMarcFileForUpload = `C11123 autotestFile.${getRandomPostfix()}.mrc`;
  const editedMarcFileName = `C11123 fileWithItemHrid.${getRandomPostfix()}.mrc`;
  const nameMarcFileForUpdate = `C11123 autotestFileForUpdateItem.${getRandomPostfix()}.mrc`;
  // unique profile names for creating
  const instanceMappingProfileNameForCreate = `C11123 autotest_instance_mapping_profile_${getRandomPostfix()}`;
  const holdingsMappingProfileNameForCreate = `C11123 autotest_holdings_mapping_profile_${getRandomPostfix()}`;
  const itemMappingProfileNameForCreate = `C11123 autotest_item_mapping_profile_${getRandomPostfix()}`;
  const instanceActionProfileNameForCreate = `C11123 autotest_instance_action_profile_${getRandomPostfix()}`;
  const holdingsActionProfileNameForCreate = `C11123 autotest_holdings_action_profile_${getRandomPostfix()}`;
  const itemActionProfileNameForCreate = `C11123 autotest_item_action_profile_${getRandomPostfix()}`;
  const jobProfileNameForCreate = `C11123 autotest_job_profile_${getRandomPostfix()}`;
  // unique profile names for updating
  const itemMappingProfileNameForUpdate = `C11123 mapping profile update item.${getRandomPostfix()}`;
  const matchProfileName = `C11123 match profile.${getRandomPostfix()}`;
  const itemActionProfileNameForUpdate = `C11123 action profile update item.${getRandomPostfix()}`;
  const jobProfileNameForUpdate = `C11123 job profile.${getRandomPostfix()}`;
  // profiles for creating instance, holdings, item
  const instanceMappingProfileForCreate = {
    profile:{
      name: instanceMappingProfileNameForCreate,
      incomingRecordType: recordType,
      existingRecordType: 'INSTANCE',
    }
  };
  const holdingsMappingProfileForCreate = {
    profile:{
      name: holdingsMappingProfileNameForCreate,
      incomingRecordType: recordType,
      existingRecordType: 'HOLDINGS',
      mappingDetails: { name: 'holdings',
        recordType: 'HOLDINGS',
        mappingFields: [
          { name: 'permanentLocationId',
            enabled: true,
            path: 'holdings.permanentLocationId',
            value: `"${permanentLocation}"` }] }
    }
  };
  const itemMappingProfileForCreate = {
    profile:{
      name: itemMappingProfileNameForCreate,
      incomingRecordType: recordType,
      existingRecordType: 'ITEM',
      mappingDetails: { name: 'item',
        recordType: 'ITEM',
        mappingFields: [
          { name: 'materialType.id',
            enabled: true,
            path: 'item.materialType.id',
            value: '"book"',
            acceptedValues: { '1a54b431-2e4f-452d-9cae-9cee66c9a892': 'book' } },
          { name: 'permanentLoanType.id',
            enabled: true,
            path: 'item.permanentLoanType.id',
            value: '"Can circulate"',
            acceptedValues: { '2b94c631-fca9-4892-a730-03ee529ffe27': 'Can circulate' } },
          { name: 'status.name',
            enabled: true,
            path: 'item.status.name',
            value: '"Available"' },
          { name: 'permanentLocation.id',
            enabled: 'true',
            path: 'item.permanentLocation.id',
            value: `"${permanentLocation}"`,
            acceptedValues: { 'fcd64ce1-6995-48f0-840e-89ffa2288371' : 'Main Library (KU/CC/DI/M)' } }] }
    }
  };
  const instanceActionProfileForCreate = {
    profile: {
      name: instanceActionProfileNameForCreate,
      action: 'CREATE',
      folioRecord: 'INSTANCE'
    },
    addedRelations: [
      {
        masterProfileId: null,
        masterProfileType: 'ACTION_PROFILE',
        detailProfileId: '',
        detailProfileType: 'MAPPING_PROFILE'
      }
    ],
    deletedRelations: []
  };
  const holdingsActionProfileForCreate = {
    profile: {
      name: holdingsActionProfileNameForCreate,
      action: 'CREATE',
      folioRecord: 'HOLDINGS'
    },
    addedRelations: [
      {
        masterProfileId: null,
        masterProfileType: 'ACTION_PROFILE',
        detailProfileId: '',
        detailProfileType: 'MAPPING_PROFILE'
      }
    ],
    deletedRelations: []
  };
  const itemActionProfileForCreate = {
    profile: {
      name: itemActionProfileNameForCreate,
      action: 'CREATE',
      folioRecord: 'ITEM'
    },
    addedRelations: [
      {
        masterProfileId: null,
        masterProfileType: 'ACTION_PROFILE',
        detailProfileId: '',
        detailProfileType: 'MAPPING_PROFILE'
      }
    ],
    deletedRelations: []
  };
  const testData = [
    { mappingProfile: instanceMappingProfileForCreate,
      actionProfile: instanceActionProfileForCreate },
    { mappingProfile: holdingsMappingProfileForCreate,
      actionProfile: holdingsActionProfileForCreate },
    { mappingProfile: itemMappingProfileForCreate,
      actionProfile: itemActionProfileForCreate },
  ];
  const jobProfileForCreate = {
    profile: {
      name: jobProfileNameForCreate,
      dataType: 'MARC'
    },
    addedRelations: [],
    deletedRelations: []
  };
  // profiles for updating item
  const matchProfile = {
    profileName: matchProfileName,
    incomingRecordFields: {
      field: '945',
      in1: '*',
      in2: '*',
      subfield: 'a'
    },
    matchCriterion: 'Exactly matches',
    existingRecordType: 'ITEM',
    itemOption: NewMatchProfile.optionsList.itemHrid
  };
  const itemMappingProfileForUpdate = {
    name: itemMappingProfileNameForUpdate,
    typeValue : NewFieldMappingProfile.folioRecordTypeValue.item
  };
  const itemActionProfileForUpdate = {
    typeValue: NewActionProfile.folioRecordTypeValue.item,
    name: itemActionProfileNameForUpdate,
    action: 'Update (all record types except Orders, Invoices, or MARC Holdings)'
  };
  const jobProfileForUpdate = {
    ...NewJobProfile.defaultJobProfile,
    profileName: jobProfileNameForUpdate,
    acceptedType: NewJobProfile.acceptedDataType.marc
  };

  before('create test data', () => {
    cy.loginAsAdmin();
    cy.getAdminToken()
      .then(() => {
        InventorySearchAndFilter.getInstancesBySubjectViaApi(instance.instanceSubject)
          .then(instances => {
            if (instances) {
              instances.forEach(({ id }) => {
                cy.deleteItemViaApi(instance.items[0].id);
                cy.deleteHoldingRecordViaApi(instance.holdings[0].id);
                InventoryInstance.deleteInstanceViaApi(id);
              });
            }
          });

        testData.jobProfileForCreate = jobProfileForCreate;

        testData.forEach(specialPair => {
          cy.createOnePairMappingAndActionProfiles(specialPair.mappingProfile, specialPair.actionProfile).then(idActionProfile => {
            cy.addJobProfileRelation(testData.jobProfileForCreate.addedRelations, idActionProfile);
          });
        });
        SettingsJobProfiles.createJobProfileApi(testData.jobProfileForCreate)
          .then((bodyWithjobProfile) => {
            testData.jobProfileForCreate.id = bodyWithjobProfile.body.id;
          });
        // upload a marc file for creating of the new instance, holding and item
        cy.visit(TopMenu.dataImportPath);
        // TODO delete code after fix https://issues.folio.org/browse/MODDATAIMP-691
        DataImport.clickDataImportNavButton();
        DataImport.uploadFile('mrcFileForC11123.mrc', marcFileForCreate);
        JobProfiles.searchJobProfileForImport(testData.jobProfileForCreate.profile.name);
        JobProfiles.runImportFile();
        JobProfiles.waitFileIsImported(marcFileForCreate);
        Logs.openFileDetails(marcFileForCreate);
        [FileDetails.columnName.srsMarc,
          FileDetails.columnName.instance,
          FileDetails.columnName.holdings,
          FileDetails.columnName.item
        ].forEach(columnName => {
          FileDetails.checkStatusInColumn(FileDetails.status.created, columnName);
        });
        FileDetails.checkItemsQuantityInSummaryTable(0, quantityOfItems);
      });
  });

  after('delete test data', () => {
    FileManager.deleteFolder(Cypress.config('downloadsFolder'));
    FileManager.deleteFile(`cypress/fixtures/${nameMarcFileForUpload}`);
    FileManager.deleteFile(`cypress/fixtures/${nameForCSVFile}`);
    JobProfiles.deleteJobProfile(jobProfileNameForCreate);
    JobProfiles.deleteJobProfile(jobProfileNameForUpdate);
    MatchProfiles.deleteMatchProfile(matchProfileName);
    ActionProfiles.deleteActionProfile(instanceActionProfileNameForCreate);
    ActionProfiles.deleteActionProfile(holdingsActionProfileNameForCreate);
    ActionProfiles.deleteActionProfile(itemActionProfileNameForCreate);
    ActionProfiles.deleteActionProfile(itemActionProfileNameForUpdate);
    FieldMappingProfiles.deleteFieldMappingProfile(instanceMappingProfileNameForCreate);
    FieldMappingProfiles.deleteFieldMappingProfile(holdingsMappingProfileNameForCreate);
    FieldMappingProfiles.deleteFieldMappingProfile(itemMappingProfileNameForCreate);
    FieldMappingProfiles.deleteFieldMappingProfile(itemMappingProfileNameForUpdate);
    cy.getInstance({ limit: 1, expandAll: true, query: `"hrid"=="${instanceHrid}"` })
      .then((initialInstance) => {
        cy.deleteItemViaApi(initialInstance.items[0].id);
        cy.deleteHoldingRecordViaApi(initialInstance.holdings[0].id);
        InventoryInstance.deleteInstanceViaApi(initialInstance.id);
      });
  });

  it('C11123 Export from Inventory, edit file, and re-import to update items (folijet)',
    { tags: [TestTypes.criticalPath, DevTeams.folijet] }, () => {
      FileDetails.openInstanceInInventory('Created');
      InventoryInstance.getAssignedHRID().then(initialInstanceHrId => {
        instanceHrid = initialInstanceHrId;

        InventoryInstance.checkIsInstancePresented(instance.instanceTitle, instance.holdingsLocation, instance.itemStatus);
        InventoryInstance.openItemByBarcode('No barcode');
        ItemRecordView.getAssignedHRID().then(initialItemHrId => {
          const itemHrid = initialItemHrId;

          ItemRecordView.closeDetailView();
          InventorySearchAndFilter.searchByParameter('Subject', instance.instanceSubject);
          InventorySearchAndFilter.saveUUIDs();
          ExportFile.downloadCSVFile(nameForCSVFile, 'SearchInstanceUUIDs*');

          // download exported marc file
          cy.visit(TopMenu.dataExportPath);
          ExportFile.uploadFile(nameForCSVFile);
          ExportFile.exportWithDefaultJobProfile(nameForCSVFile);
          ExportFile.downloadExportedMarcFile(nameMarcFileForUpload);

          // change file using item hrid for 945 field
          DataImport.editMarcFile(
            nameMarcFileForUpload,
            editedMarcFileName,
            ['testHrid'],
            [itemHrid]
          );
        });

        // create mapping profile for update
        cy.visit(SettingsMenu.mappingProfilePath);
        FieldMappingProfiles.openNewMappingProfileForm();
        NewFieldMappingProfile.fillSummaryInMappingProfile(itemMappingProfileForUpdate);
        NewFieldMappingProfile.addAdministrativeNote(note, 7);
        FieldMappingProfiles.saveProfile();
        FieldMappingProfiles.closeViewModeForMappingProfile(itemMappingProfileNameForUpdate);
        FieldMappingProfiles.checkMappingProfilePresented(itemMappingProfileNameForUpdate);

        // create action profile for update
        cy.visit(SettingsMenu.actionProfilePath);
        ActionProfiles.create(itemActionProfileForUpdate, itemMappingProfileNameForUpdate);
        ActionProfiles.checkActionProfilePresented(itemActionProfileNameForUpdate);

        // create match profile for update
        cy.visit(SettingsMenu.matchProfilePath);
        MatchProfiles.createMatchProfile(matchProfile);
        MatchProfiles.checkMatchProfilePresented(matchProfileName);

        // create job profile for update
        cy.visit(SettingsMenu.jobProfilePath);
        JobProfiles.createJobProfileWithLinkingProfiles(jobProfileForUpdate, itemActionProfileNameForUpdate, matchProfileName);
        JobProfiles.checkJobProfilePresented(jobProfileNameForUpdate);

        // upload a marc file for creating of the new instance, holding and item
        cy.visit(TopMenu.dataImportPath);
        // TODO delete code after fix https://issues.folio.org/browse/MODDATAIMP-691
        DataImport.clickDataImportNavButton();
        DataImport.uploadFile(editedMarcFileName, nameMarcFileForUpdate);
        JobProfiles.searchJobProfileForImport(jobProfileNameForUpdate);
        JobProfiles.runImportFile();
        JobProfiles.waitFileIsImported(nameMarcFileForUpdate);
        Logs.openFileDetails(nameMarcFileForUpdate);
        FileDetails.checkStatusInColumn(FileDetails.status.updated, FileDetails.columnName.item);
        FileDetails.checkItemQuantityInSummaryTable(quantityOfItems, 1);

        cy.visit(TopMenu.inventoryPath);
        InventorySearchAndFilter.searchInstanceByHRID(instanceHrid);
        InventoryInstance.openHoldingsAccordion('Main Library >');
        InventoryInstance.openItemByBarcode('No barcode');
        ItemRecordView.checkItemAdministrativeNote(note);
      });
    });
});
