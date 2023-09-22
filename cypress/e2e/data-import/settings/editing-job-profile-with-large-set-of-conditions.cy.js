import getRandomPostfix from '../../../support/utils/stringTools';
import { DevTeams, TestTypes, Permissions } from '../../../support/dictionary';
import {
  FOLIO_RECORD_TYPE,
  BATCH_GROUP,
  ITEM_STATUS_NAMES,
  MATERIAL_TYPE_NAMES,
  LOAN_TYPE_NAMES,
  VENDOR_NAMES,
  PAYMENT_METHOD,
  INSTANCE_STATUS_TERM_NAMES,
  LOCATION_NAMES,
  EXISTING_RECORDS_NAMES,
} from '../../../support/constants';
import SettingsMenu from '../../../support/fragments/settingsMenu';
import FieldMappingProfiles from '../../../support/fragments/data_import/mapping_profiles/fieldMappingProfiles';
import NewFieldMappingProfile from '../../../support/fragments/data_import/mapping_profiles/newFieldMappingProfile';
import NewMatchProfile from '../../../support/fragments/data_import/match_profiles/newMatchProfile';
import ActionProfiles from '../../../support/fragments/data_import/action_profiles/actionProfiles';
import Users from '../../../support/fragments/users/users';

describe('data-import', () => {
  describe('Settings', () => {
    let user;
    const collectionOfMappingAndActionProfiles = [
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.HOLDINGS,
          name: `C354282 #1autotestHoldingsMappingProfile_${getRandomPostfix()}`,
          formerHoldings: 'Add these to existing',
          formerHoldingsId: `TEST-test_${getRandomPostfix()}`,
          callNumber: 'Success',
        },
        actionProfile: {
          typeValue: FOLIO_RECORD_TYPE.HOLDINGS,
          name: `C354282 #1autotestHoldingsActionProfile_${getRandomPostfix()}`,
          action: 'Update (all record types except Orders, Invoices, or MARC Holdings)',
        },
      },
      {
        mappingProfile: {
          name: `C354282 #2autotestInvoiceMappingProfile_${getRandomPostfix()}`,
          incomingRecordType: NewFieldMappingProfile.incomingRecordType.edifact,
          existingRecordType: FOLIO_RECORD_TYPE.INVOICE,
          invoiceDate: 'DTM+137[2]',
          batchGroup: BATCH_GROUP.FOLIO,
          vendorInvoiceNumber: 'BGM+380+[1]',
          vendorName: VENDOR_NAMES.EBSCO,
          paymentMethod: PAYMENT_METHOD.EFT,
          currency: 'USD',
          invoiceLinePOlDescription: '{POL_title}; else IMD+L+050+[4-5]',
          polNumber: 'RFF+LI[2]',
          vendorReferenceNumber: 'RFF+SNA[2]',
          vendorReferenceType: 'Vendor order reference number',
          subscriptionStartDate: 'DTM+194[2]',
          subscriptionEndDate: 'DTM+206[2]',
          quantity: 'QTY+47[2]',
          subTotal: 'MOA+203[2]',
          fundDistributionSource: 'Use fund distribution from POL',
        },
        actionProfile: {
          typeValue: FOLIO_RECORD_TYPE.INVOICE,
          name: `C354282 #2autotestInvoiceActionProfile_${getRandomPostfix()}`,
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.INSTANCE,
          name: `C354282 #3autotestInstanceMappingProfile_${getRandomPostfix()}`,
        },
        actionProfile: {
          typeValue: FOLIO_RECORD_TYPE.INSTANCE,
          name: `C354282 #3autotestInstanceActionProfile_${getRandomPostfix()}`,
          action: 'Update (all record types except Orders, Invoices, or MARC Holdings)',
        },
      },
      {
        mappingProfile: {
          name: `C354282 #4autotestInvoiceMappingProfile_${getRandomPostfix()}`,
          incomingRecordType: NewFieldMappingProfile.incomingRecordType.edifact,
          existingRecordType: FOLIO_RECORD_TYPE.INVOICE,
          invoiceDate: 'DTM+137[2]',
          status: 'Open',
          batchGroup: BATCH_GROUP.FOLIO,
          vendorInvoiceNumber: 'BGM+380+[1]',
          vendorName: VENDOR_NAMES.HARRASSOWITZ,
          paymentMethod: PAYMENT_METHOD.OTHER,
          currency: 'USD',
          invoiceLinePOlDescription: '{POL_title}; else IMD+L+050+[4-5]',
          polNumber: 'RFF+LI[2]',
          vendorReferenceNumber: 'RFF+SNA[2]',
          vendorReferenceType: 'Vendor order reference number',
          subscriptionStartDate: 'DTM+194[2]',
          subscriptionEndDate: 'DTM+206[2]',
          quantity: 'QTY+47[2]',
          subTotal: 'MOA+203[2]',
          fundDistributionSource: 'Use fund distribution from POL',
        },
        actionProfile: {
          typeValue: FOLIO_RECORD_TYPE.INVOICE,
          name: `C354282 #4autotestInvoiceActionProfile_${getRandomPostfix()}`,
        },
      },
      {
        mappingProfile: {
          name: `C354282 #5autotestInvoiceMappingProfile_${getRandomPostfix()}`,
          incomingRecordType: NewFieldMappingProfile.incomingRecordType.edifact,
          existingRecordType: FOLIO_RECORD_TYPE.INVOICE,
          invoiceDate: 'DTM+137[2]',
          status: 'Open',
          batchGroup: BATCH_GROUP.FOLIO,
          vendorInvoiceNumber: 'BGM+380+[1]',
          vendorName: VENDOR_NAMES.HARRASSOWITZ,
          paymentMethod: PAYMENT_METHOD.EFT,
          currency: 'USD',
          invoiceLinePOlDescription: '{POL_title}; else IMD+L+050+[4-5]',
          polNumber: 'RFF+LI[2]',
          vendorReferenceNumber: 'RFF+SNA[2]',
          vendorReferenceType: 'Vendor order reference number',
          subscriptionStartDate: 'DTM+194[2]',
          subscriptionEndDate: 'DTM+206[2]',
          quantity: 'QTY+47[2]',
          subTotal: 'MOA+203[2]',
          fundDistributionSource: 'Use fund distribution from POL',
        },
        actionProfile: {
          typeValue: FOLIO_RECORD_TYPE.INVOICE,
          name: `C354282 #5autotestInvoiceActionProfile_${getRandomPostfix()}`,
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.INSTANCE,
          name: `C354282 #6autotestInstanceMappingProfile_${getRandomPostfix()}`,
        },
        actionProfile: {
          typeValue: FOLIO_RECORD_TYPE.INSTANCE,
          name: `C354282 #6autotestInstanceActionProfile_${getRandomPostfix()}`,
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.INSTANCE,
          name: `C354282 #7autotestInstanceMappingProfile_${getRandomPostfix()}`,
          catalogedDate: '###TODAY###',
          instanceStatusTerm: INSTANCE_STATUS_TERM_NAMES.BATCH_LOADED,
          statisticalCode: 'ARL (Collection stats): books - Book, print (books)',
        },
        actionProfile: {
          typeValue: FOLIO_RECORD_TYPE.INSTANCE,
          name: `C354282 #7autotestInstanceActionProfile_${getRandomPostfix()}`,
          action: 'Update (all record types except Orders, Invoices, or MARC Holdings)',
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.MARCBIBLIOGRAPHIC,
          name: `C354282 #8autotestMarcBibMappingProfile_${getRandomPostfix()}`,
          modifications: {
            action: 'Add',
            field: '650',
            ind1: '',
            ind2: '4',
            subfield: 'a',
            data: `Test Update.${getRandomPostfix()}`,
          },
        },
        actionProfile: {
          typeValue: FOLIO_RECORD_TYPE.MARCBIBLIOGRAPHIC,
          name: `C354282 #8autotestMarcBibActionProfile_${getRandomPostfix()}`,
          action: 'Modify (MARC Bibliographic record type only)',
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.HOLDINGS,
          name: `C354282 #9autotestHoldingsMappingProfile_${getRandomPostfix()}`,
          permanentLocation: `"${LOCATION_NAMES.ONLINE}"`,
          temporaryLocation: `"${LOCATION_NAMES.ANNEX}"`,
        },
        actionProfile: {
          typeValue: FOLIO_RECORD_TYPE.HOLDINGS,
          name: `C354282 #9autotestHoldingsActionProfile_${getRandomPostfix()}`,
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.INSTANCE,
          name: `C354282 #10autotestInstanceMappingProfile_${getRandomPostfix()}`,
          catalogedDate: '901$a; else ###TODAY###',
        },
        actionProfile: {
          typeValue: FOLIO_RECORD_TYPE.INSTANCE,
          name: `C354282 #10autotestInstanceActionProfile_${getRandomPostfix()}`,
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.ITEM,
          name: `C354282 #11autotestItemMappingProfile_${getRandomPostfix()}`,
          barcode: `"barcode_${getRandomPostfix()}"`,
        },
        actionProfile: {
          typeValue: FOLIO_RECORD_TYPE.ITEM,
          name: `C354282 #11autotestItemActionProfile_${getRandomPostfix()}`,
          action: 'Update (all record types except Orders, Invoices, or MARC Holdings)',
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.HOLDINGS,
          name: `C354282 #12autotestHoldingsMappingProfile_${getRandomPostfix()}`,
          permanentLocation: `"${LOCATION_NAMES.ANNEX}"`,
        },
        actionProfile: {
          typeValue: FOLIO_RECORD_TYPE.HOLDINGS,
          name: `C354282 #12autotestHoldingsActionProfile_${getRandomPostfix()}`,
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.ITEM,
          name: `C354282 #13autotestItemMappingProfile_${getRandomPostfix()}`,
          barcode: `"barcode_${getRandomPostfix()}"`,
          materialType: MATERIAL_TYPE_NAMES.BOOK,
          status: ITEM_STATUS_NAMES.IN_PROCESS,
          permanentLoanType: LOAN_TYPE_NAMES.CAN_CIRCULATE,
        },
        actionProfile: {
          typeValue: FOLIO_RECORD_TYPE.ITEM,
          name: `C354282 #13autotestItemActionProfile_${getRandomPostfix()}`,
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.INSTANCE,
          name: `C354282 #14autotestInstanceMappingProfile_${getRandomPostfix()}`,
        },
        actionProfile: {
          typeValue: FOLIO_RECORD_TYPE.INSTANCE,
          name: `C354282 #14autotestInstanceActionProfile_${getRandomPostfix()}`,
        },
      },
      {
        mappingProfile: {
          name: `C354282 #15autotestInvoiceMappingProfile_${getRandomPostfix()}`,
          incomingRecordType: NewFieldMappingProfile.incomingRecordType.edifact,
          existingRecordType: FOLIO_RECORD_TYPE.INVOICE,
          invoiceDate: 'DTM+137[2]',
          status: 'Open',
          batchGroup: BATCH_GROUP.FOLIO,
          billToName: 'SR',
          vendorInvoiceNumber: 'BGM+380+[1]',
          vendorName: VENDOR_NAMES.HARRASSOWITZ,
          paymentMethod: PAYMENT_METHOD.CREDIT_CARD,
          currency: 'USD',
          invoiceLinePOlDescription: '{POL_title}; else IMD+L+050+[4-5]',
          polNumber: 'RFF+SNL[2]',
          vendorReferenceNumber: 'RFF+SNA[2]',
          vendorReferenceType: 'Vendor order reference number',
          quantity: 'QTY+47[2]',
          subTotal: 'MOA+203[2]',
          fundDistributionSource: 'Use fund distribution from POL',
        },
        actionProfile: {
          typeValue: FOLIO_RECORD_TYPE.INVOICE,
          name: `C354282 #15autotestInvoiceActionProfile_${getRandomPostfix()}`,
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.MARCBIBLIOGRAPHIC,
          name: `C354282 #16autotestMarcBibMappingProfile_${getRandomPostfix()}`,
          modifications: {
            action: 'Add',
            field: '947',
            ind1: '',
            ind2: '',
            subfield: 'a',
            data: `Test.${getRandomPostfix()}`,
            subaction: 'Add subfield',
            subfieldInd1: 'b',
            subfieldData: `Addition.${getRandomPostfix()}`,
          },
        },
        actionProfile: {
          typeValue: FOLIO_RECORD_TYPE.MARCBIBLIOGRAPHIC,
          name: `C354282 #16autotestMarcBibActionProfile_${getRandomPostfix()}`,
          action: 'Modify (MARC Bibliographic record type only)',
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.HOLDINGS,
          name: `C354282 #17autotestHoldingsMappingProfile_${getRandomPostfix()}`,
          permanentLocation: `"${LOCATION_NAMES.ANNEX}"`,
        },
        actionProfile: {
          typeValue: FOLIO_RECORD_TYPE.HOLDINGS,
          name: `C354282 #17autotestHoldingsActionProfile_${getRandomPostfix()}`,
        },
      },
    ];
    const collectionOfMatchProfiles = [
      {
        matchProfile: {
          profileName: `C354282 #1autotestMatchProfile_${getRandomPostfix()}`,
          incomingRecordFields: {
            field: '035',
            subfield: 'a',
          },
          qualifierType: 'Begins with',
          qualifierValue: '(SE-LIBR)',
          matchCriterion: 'Exactly matches',
          existingRecordType: EXISTING_RECORDS_NAMES.INSTANCE,
          existingRecordOption: NewMatchProfile.optionsList.systemControlNumber,
        },
      },
      {
        matchProfile: {
          profileName: `C354282 #2autotestMatchProfile_${getRandomPostfix()}`,
          incomingRecordFields: {
            field: '901',
            subfield: 'a',
          },
          qualifierType: 'Begins with',
          qualifierValue: '(SE-LIBR)',
          matchCriterion: 'Exactly matches',
          existingRecordFields: {
            field: '001',
          },
          existingRecordType: EXISTING_RECORDS_NAMES.MARC_BIBLIOGRAPHIC,
        },
      },
      {
        matchProfile: {
          profileName: `C354282 #3autotestMatchProfile_${getRandomPostfix()}`,
          incomingRecordFields: {
            field: '001',
          },
          matchCriterion: 'Exactly matches',
          existingRecordType: EXISTING_RECORDS_NAMES.INSTANCE,
          instanceOption: NewMatchProfile.optionsList.instanceHrid,
        },
      },
      {
        matchProfile: {
          profileName: `C354282 #4autotestMatchProfile_${getRandomPostfix()}`,
          incomingRecordFields: {
            field: '951',
            subfield: 'a',
          },
          qualifierType: 'Begins with',
          qualifierValue: '(SE-LIBR)',
          matchCriterion: 'Exactly matches',
          existingRecordType: EXISTING_RECORDS_NAMES.INSTANCE,
          existingRecordOption: NewMatchProfile.optionsList.suppressFromDiscovery,
        },
      },
      {
        matchProfile: {
          profileName: `C354282 #5autotestMatchProfile_${getRandomPostfix()}`,
          incomingRecordFields: {
            field: '945',
            subfield: 'a',
          },
          matchCriterion: 'Exactly matches',
          existingRecordType: EXISTING_RECORDS_NAMES.ITEM,
          itemOption: NewMatchProfile.optionsList.itemHrid,
        },
      },
      {
        matchProfile: {
          profileName: `C354282 #6autotestMatchProfile_${getRandomPostfix()}`,
          incomingRecordFields: {
            field: '999',
            in1: 'f',
            in2: 'f',
            subfield: 'i',
          },
          qualifierType: 'Begins with',
          qualifierValue: '(SE-LIBR)',
          matchCriterion: 'Exactly matches',
          existingRecordFields: {
            field: '999',
            in1: 'f',
            in2: 'f',
            subfield: 'i',
          },
          existingRecordType: EXISTING_RECORDS_NAMES.MARC_BIBLIOGRAPHIC,
        },
      },
      {
        matchProfile: {
          profileName: `C354282 #7autotestMatchProfile_${getRandomPostfix()}`,
          incomingRecordFields: {
            field: '999',
            in1: 'f',
            in2: 'f',
            subfield: 'i',
          },
          qualifierType: 'Begins with',
          qualifierValue: '(SE-LIBR)',
          matchCriterion: 'Exactly matches',
          existingRecordFields: {
            field: '999',
            in1: 'f',
            in2: 'f',
            subfield: 'i',
          },
          existingRecordType: EXISTING_RECORDS_NAMES.MARC_BIBLIOGRAPHIC,
        },
      },
      {
        mathcProfile: {
          profileName: `C354282 #8autotestMatchProfile_${getRandomPostfix()}`,
          incomingRecordFields: {
            field: '001',
          },
          qualifierType: 'Begins with',
          qualifierValue: '(SE-LIBR)',
          matchCriterion: 'Exactly matches',
          existingRecordFields: {
            field: '001',
          },
          existingRecordType: EXISTING_RECORDS_NAMES.MARC_BIBLIOGRAPHIC,
        },
      },
      {
        matchProfile: {
          profileName: `C354282 #9autotestMatchProfile_${getRandomPostfix()}`,
          incomingRecordFields: {
            field: '852',
            subfield: 'b',
          },
          matchCriterion: 'Exactly matches',
          existingRecordType: EXISTING_RECORDS_NAMES.HOLDINGS,
          holdingsOption: NewMatchProfile.optionsList.holdingsPermLoc,
        },
      },
      {
        matchProfile: {
          profileName: `C354282 #10autotestMatchProfile_${getRandomPostfix()}`,
          incomingRecordFields: {
            field: '001',
          },
          matchCriterion: 'Exactly matches',
          existingRecordType: EXISTING_RECORDS_NAMES.INSTANCE,
          instanceOption: NewMatchProfile.optionsList.instanceHrid,
        },
      },
      {
        matchProfile: {
          profileName: `C354282 #11autotestMatchProfile_${getRandomPostfix()}`,
          incomingRecordFields: {
            field: '001',
          },
          qualifierType: 'Begins with',
          qualifierValue: '(SE-LIBR)',
          matchCriterion: 'Exactly matches',
          existingRecordFields: {
            field: '001',
          },
          existingRecordType: EXISTING_RECORDS_NAMES.MARC_BIBLIOGRAPHIC,
        },
      },
    ];

    before('login', () => {
      cy.createTempUser([
        Permissions.settingsDataImportEnabled.gui,
        Permissions.uiOrganizationsViewEditCreate.gui,
      ]).then((userProperties) => {
        user = userProperties;
        cy.login(user.username, user.password, {
          path: SettingsMenu.mappingProfilePath,
          waiter: FieldMappingProfiles.waitLoading,
        });
      });
    });

    it(
      'C354282 Check editing of a job profile with a large set of conditions. (folijet)',
      { tags: [TestTypes.extendedPath, DevTeams.folijet] },
      () => {
        FieldMappingProfiles.openNewMappingProfileForm();
        NewFieldMappingProfile.fillSummaryInMappingProfile(
          collectionOfMappingAndActionProfiles[0].mappingProfile,
        );
        NewFieldMappingProfile.addFormerHoldings(
          collectionOfMappingAndActionProfiles[0].mappingProfile.formerHoldingsId,
        );
        NewFieldMappingProfile.fillCallNumber(
          `"${collectionOfMappingAndActionProfiles[0].mappingProfile.callNumber}"`,
        );
        FieldMappingProfiles.saveProfile();
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[0].mappingProfile.name,
        );
        FieldMappingProfiles.checkMappingProfilePresented(
          collectionOfMappingAndActionProfiles[0].mappingProfile.name,
        );
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[0].mappingProfile.name,
        );

        FieldMappingProfiles.createInvoiceMappingProfile(
          collectionOfMappingAndActionProfiles[1].mappingProfile,
        );
        FieldMappingProfiles.checkMappingProfilePresented(
          collectionOfMappingAndActionProfiles[1].mappingProfile.name,
        );
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[1].mappingProfile.name,
        );

        FieldMappingProfiles.openNewMappingProfileForm();
        NewFieldMappingProfile.fillSummaryInMappingProfile(
          collectionOfMappingAndActionProfiles[2].mappingProfile,
        );
        FieldMappingProfiles.saveProfile();
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[2].mappingProfile.name,
        );
        FieldMappingProfiles.checkMappingProfilePresented(
          collectionOfMappingAndActionProfiles[2].mappingProfile.name,
        );
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[2].mappingProfile.name,
        );

        FieldMappingProfiles.waitLoading();
        FieldMappingProfiles.createInvoiceMappingProfile(
          collectionOfMappingAndActionProfiles[3].mappingProfile,
        );
        FieldMappingProfiles.checkMappingProfilePresented(
          collectionOfMappingAndActionProfiles[3].mappingProfile.name,
        );
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[3].mappingProfile.name,
        );

        FieldMappingProfiles.waitLoading();
        FieldMappingProfiles.createInvoiceMappingProfile(
          collectionOfMappingAndActionProfiles[4].mappingProfile,
        );
        FieldMappingProfiles.checkMappingProfilePresented(
          collectionOfMappingAndActionProfiles[4].mappingProfile.name,
        );
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[4].mappingProfile.name,
        );

        FieldMappingProfiles.openNewMappingProfileForm();
        NewFieldMappingProfile.fillSummaryInMappingProfile(
          collectionOfMappingAndActionProfiles[5].mappingProfile,
        );
        FieldMappingProfiles.saveProfile();
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[5].mappingProfile.name,
        );
        FieldMappingProfiles.checkMappingProfilePresented(
          collectionOfMappingAndActionProfiles[5].mappingProfile.name,
        );
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[5].mappingProfile.name,
        );

        FieldMappingProfiles.openNewMappingProfileForm();
        NewFieldMappingProfile.fillSummaryInMappingProfile(
          collectionOfMappingAndActionProfiles[6].mappingProfile,
        );
        NewFieldMappingProfile.fillCatalogedDate(
          collectionOfMappingAndActionProfiles[6].mappingProfile.catalogedDate,
        );
        NewFieldMappingProfile.fillInstanceStatusTerm(
          collectionOfMappingAndActionProfiles[6].mappingProfile.instanceStatusTerm,
        );
        NewFieldMappingProfile.addStatisticalCode(
          collectionOfMappingAndActionProfiles[6].mappingProfile.statisticalCode,
          8,
        );
        FieldMappingProfiles.saveProfile();
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[6].mappingProfile.name,
        );
        FieldMappingProfiles.checkMappingProfilePresented(
          collectionOfMappingAndActionProfiles[6].mappingProfile.name,
        );
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[6].mappingProfile.name,
        );

        FieldMappingProfiles.openNewMappingProfileForm();
        NewFieldMappingProfile.fillSummaryInMappingProfile(
          collectionOfMappingAndActionProfiles[7].mappingProfile,
        );
        NewFieldMappingProfile.addFieldMappingsForMarc();
        NewFieldMappingProfile.fillModificationSectionWithAdd(
          collectionOfMappingAndActionProfiles[7].mappingProfile.modifications,
        );
        FieldMappingProfiles.saveProfile();
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[7].mappingProfile.name,
        );
        FieldMappingProfiles.checkMappingProfilePresented(
          collectionOfMappingAndActionProfiles[7].mappingProfile.name,
        );
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[7].mappingProfile.name,
        );

        FieldMappingProfiles.openNewMappingProfileForm();
        NewFieldMappingProfile.fillSummaryInMappingProfile(
          collectionOfMappingAndActionProfiles[8].mappingProfile,
        );
        NewFieldMappingProfile.fillPermanentLocation(
          collectionOfMappingAndActionProfiles[8].mappingProfile.permanentLocation,
        );
        NewFieldMappingProfile.fillTemporaryLocation(
          collectionOfMappingAndActionProfiles[8].mappingProfile.temporaryLocation,
        );
        FieldMappingProfiles.saveProfile();
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[8].mappingProfile.name,
        );
        FieldMappingProfiles.checkMappingProfilePresented(
          collectionOfMappingAndActionProfiles[8].mappingProfile.name,
        );
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[8].mappingProfile.name,
        );

        FieldMappingProfiles.openNewMappingProfileForm();
        NewFieldMappingProfile.fillSummaryInMappingProfile(
          collectionOfMappingAndActionProfiles[9].mappingProfile,
        );
        NewFieldMappingProfile.fillCatalogedDate(
          collectionOfMappingAndActionProfiles[9].mappingProfile.catalogedDate,
        );
        FieldMappingProfiles.saveProfile();
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[9].mappingProfile.name,
        );
        FieldMappingProfiles.checkMappingProfilePresented(
          collectionOfMappingAndActionProfiles[9].mappingProfile.name,
        );
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[9].mappingProfile.name,
        );

        FieldMappingProfiles.openNewMappingProfileForm();
        NewFieldMappingProfile.fillSummaryInMappingProfile(
          collectionOfMappingAndActionProfiles[10].mappingProfile,
        );
        NewFieldMappingProfile.fillBarcode(
          collectionOfMappingAndActionProfiles[10].mappingProfile.barcode,
        );
        FieldMappingProfiles.saveProfile();
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[10].mappingProfile.name,
        );
        FieldMappingProfiles.checkMappingProfilePresented(
          collectionOfMappingAndActionProfiles[10].mappingProfile.name,
        );
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[10].mappingProfile.name,
        );

        FieldMappingProfiles.openNewMappingProfileForm();
        NewFieldMappingProfile.fillSummaryInMappingProfile(
          collectionOfMappingAndActionProfiles[11].mappingProfile,
        );
        NewFieldMappingProfile.fillPermanentLocation(
          collectionOfMappingAndActionProfiles[11].mappingProfile.permanentLocation,
        );
        FieldMappingProfiles.saveProfile();
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[11].mappingProfile.name,
        );
        FieldMappingProfiles.checkMappingProfilePresented(
          collectionOfMappingAndActionProfiles[11].mappingProfile.name,
        );
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[11].mappingProfile.name,
        );

        FieldMappingProfiles.openNewMappingProfileForm();
        NewFieldMappingProfile.fillSummaryInMappingProfile(
          collectionOfMappingAndActionProfiles[12].mappingProfile,
        );
        NewFieldMappingProfile.fillBarcode(
          collectionOfMappingAndActionProfiles[12].mappingProfile.barcode,
        );
        NewFieldMappingProfile.fillMaterialType(
          `"${collectionOfMappingAndActionProfiles[12].mappingProfile.materialType}"`,
        );
        NewFieldMappingProfile.fillPermanentLoanType(
          collectionOfMappingAndActionProfiles[12].mappingProfile.permanentLoanType,
        );
        NewFieldMappingProfile.fillStatus(
          collectionOfMappingAndActionProfiles[12].mappingProfile.status,
        );
        FieldMappingProfiles.saveProfile();
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[12].mappingProfile.name,
        );
        FieldMappingProfiles.checkMappingProfilePresented(
          collectionOfMappingAndActionProfiles[12].mappingProfile.name,
        );
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[12].mappingProfile.name,
        );

        FieldMappingProfiles.openNewMappingProfileForm();
        NewFieldMappingProfile.fillSummaryInMappingProfile(
          collectionOfMappingAndActionProfiles[13].mappingProfile,
        );
        FieldMappingProfiles.saveProfile();
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[13].mappingProfile.name,
        );
        FieldMappingProfiles.checkMappingProfilePresented(
          collectionOfMappingAndActionProfiles[13].mappingProfile.name,
        );
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[13].mappingProfile.name,
        );

        FieldMappingProfiles.waitLoading();
        FieldMappingProfiles.createInvoiceMappingProfile(
          collectionOfMappingAndActionProfiles[14].mappingProfile,
        );
        FieldMappingProfiles.checkMappingProfilePresented(
          collectionOfMappingAndActionProfiles[14].mappingProfile.name,
        );
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[14].mappingProfile.name,
        );

        FieldMappingProfiles.openNewMappingProfileForm();
        NewFieldMappingProfile.fillSummaryInMappingProfile(
          collectionOfMappingAndActionProfiles[15].mappingProfile,
        );
        NewFieldMappingProfile.addFieldMappingsForMarc();
        NewFieldMappingProfile.fillModificationSectionWithAdd(
          collectionOfMappingAndActionProfiles[15].mappingProfile.modifications,
        );
        FieldMappingProfiles.saveProfile();
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[15].mappingProfile.name,
        );
        FieldMappingProfiles.checkMappingProfilePresented(
          collectionOfMappingAndActionProfiles[15].mappingProfile.name,
        );
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[15].mappingProfile.name,
        );

        FieldMappingProfiles.openNewMappingProfileForm();
        NewFieldMappingProfile.fillSummaryInMappingProfile(
          collectionOfMappingAndActionProfiles[16].mappingProfile,
        );
        NewFieldMappingProfile.fillPermanentLocation(
          collectionOfMappingAndActionProfiles[16].mappingProfile.permanentLocation,
        );
        FieldMappingProfiles.saveProfile();
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[16].mappingProfile.name,
        );
        FieldMappingProfiles.checkMappingProfilePresented(
          collectionOfMappingAndActionProfiles[16].mappingProfile.name,
        );
        FieldMappingProfiles.closeViewModeForMappingProfile(
          collectionOfMappingAndActionProfiles[16].mappingProfile.name,
        );

        cy.wrap(collectionOfMappingAndActionProfiles).each((profile) => {
          cy.visit(SettingsMenu.actionProfilePath);
          cy.wait(2000);
          ActionProfiles.create(profile.actionProfile, profile.mappingProfile.name);
          ActionProfiles.checkActionProfilePresented(profile.actionProfile.name);
        });
      },
    );
  });
});
