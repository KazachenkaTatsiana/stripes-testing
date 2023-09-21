import getRandomPostfix from '../../../support/utils/stringTools';
import { DevTeams, TestTypes, Permissions } from '../../../support/dictionary';
import {
  FOLIO_RECORD_TYPE,
  BATCH_GROUP,
  ITEM_STATUS_NAMES,
  MATERIAL_TYPE_NAMES,
  LOAN_TYPE_NAMES,
} from '../../../support/constants';
import SettingsMenu from '../../../support/fragments/settingsMenu';
import Users from '../../../support/fragments/users/users';

describe('data-import', () => {
  describe('Settings', () => {
    let user;
    const collectionOfMappingProfiles = [
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.HOLDINGS,
          name: `C354282 Holdings Update Success_${getRandomPostfix()}`,
          formerHoldings: 'Add these to existing',
          formerHoldingsId: 'TEST-test_${getRandomPostfix()',
          cullNumber: 'Success',
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.HOLDINGS,
          name: `C354282 Create large EBSCO subscription invoice_${getRandomPostfix()}`,
          incomingRecordType: FOLIO_RECORD_TYPE.EDIFACT,
          existingRecordType: FOLIO_RECORD_TYPE.INVOICE,
          invoiceDate: 'DTM+137[2]',
          batchGroup: BATCH_GROUP.FOLIO,
          vendorInvoiceNumber: 'BGM+380+[1]',
          vendorName: 'EBSCO SUBSCRIPTION SERV',
          accountingCode: '461278418',
          paymentMethod: 'EFT',
          currency: 'USD',
          description: '{POL_title}; else IMD+L+050+[4-5]',
          poLineNumber: 'RFF+LI[2]',
          vendorReferenceNumber: 'RFF+SNA[2]',
          vendorReferenceType: 'Vendor order reference number',
          subscriptionStartDate: 'DTM+194[2]',
          subscriptionEndDate: 'DTM+206[2]',
          quantity: 'QTY+47[2]',
          subTotal: 'MOA+203[2]',
          fundDistributionSource: '',
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.INSTANCE,
          name: `C354282 OCLC Overlay_${getRandomPostfix()}`,
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.INVOICE,
          name: `C354282 Create Large Harrassowitz serial invoice IMD+L_${getRandomPostfix()}`,
          incomingRecordType: FOLIO_RECORD_TYPE.EDIFACT,
          invoiceDate: 'DTM+137[2]',
          status: 'Open',
          batchGroup: BATCH_GROUP.FOLIO,
          vendorInvoiceNumber: 'BGM+380+[1]',
          vendorName: 'HARRASSOWITZ',
          accountingCode: '71289312674516',
          paymentMethod: 'Other',
          currency: 'USD',
          description: '{POL_title}; else IMD+L+050+[4-5]',
          poLineNumber: 'RFF+LI[2]',
          vendorReferenceNumber: 'RFF+SNA[2]',
          vendorReferenceType: 'Vendor order reference number',
          subscriptionStartDate: 'DTM+194[2]',
          subscriptionEndDate: 'DTM+206[2]',
          quantity: 'QTY+47[2]',
          subTotal: 'MOA+203[2]',
          fundDistributionSource: '',
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.INVOICE,
          name: `C354282 Check VRN Match_${getRandomPostfix()}`,
          incomingRecordType: FOLIO_RECORD_TYPE.EDIFACT,
          invoice: 'DTM+137[2]',
          status: 'Open',
          batchGroup: BATCH_GROUP.MED,
          vendorInvoiceNumber: 'BGM+380+[1]',
          vendorName: 'HARRASSOWITZ',
          accountingCode: '71289312674516',
          paymentMethod: 'EFT',
          currency: 'USD',
          description: '{POL_title}; else IMD+L+050+[4-5]',
          poLineNumber: 'RFF+LI[2]',
          vendorReferenceNumber: 'RFF+SNA[2]',
          vendorReferenceType: 'Vendor order reference number',
          subscriptionStartDate: 'DTM+194[2]',
          subscriptionEndDate: 'DTM+206[2]',
          quantity: 'QTY+47[2]',
          subTotal: 'MOA+203[2]',
          fundDistributionSource: '',
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.INSTANCE,
          name: `C354282 1## mapping profile_${getRandomPostfix()}`,
          catalogedDate: '###TODAY###',
          instanceStatusTerm: 'Electronic resource temporary',
          statisticalCode: 'Consortial DDA: DPQ - DDA ProQuest',
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.MARCBIBLIOGRAPHIC,
          name: `C354282 autotest_marcBib_mapping_profile_${getRandomPostfix()}`,
          modifications: {
            action: 'Add',
            field: '650',
            ind1: '-',
            ind2: '4',
            subfield: 'a',
            data: `Test Update.${getRandomPostfix()}`,
            subaction: '-',
          },
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.INSTANCE,
          name: `C354282 test profile_${getRandomPostfix()}`,
          catalogedDate: '###TODAY###',
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.HOLDINGS,
          name: `C354282 ## map prof Holding_${getRandomPostfix()}`,
          permanentLocation: 'circ lap (circ,lap)',
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.ITEM,
          name: `C354282 autotestMappingItem_${getRandomPostfix()}`,
          barcode: '',
          materialType: `"${MATERIAL_TYPE_NAMES.BOOK}"`,
          status: ITEM_STATUS_NAMES,
          permanentLoanType: LOAN_TYPE_NAMES.CAN_CIRCULATE,
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.INSTANCE,
          name: `C354282 autotestMappingInstance_${getRandomPostfix()}`,
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.INVOICE,
          name: `C354282 ##Create Large Harrassowitz serial invoice_${getRandomPostfix()}`,
          incomingRecordType: FOLIO_RECORD_TYPE.EDIFACT,
          invoice: 'DTM+137[2]',
          status: 'Open',
          batchGroup: BATCH_GROUP.FOLIO,
          billToName: 'SR',
          vendorInvoiceNumber: 'BGM+380+[1]',
          vendorName: 'HARRASSOWITZ',
          accountingCode: '419417846178',
          paymentMethod: 'Credit Card',
          currency: 'USD',
          description: '{POL_title}; else IMD+L+050+[4-5]',
          poLineNumber: 'RFF+SNL[2]',
          vendorReferenceNumber: 'RFF+SNA[2]',
          vendorReferenceType: 'Vendor order reference number',
          quantity: 'QTY+47[2]',
          subTotal: 'MOA+203[2]',
          fundDistributionSource: '',
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.MARCBIBLIOGRAPHIC,
          name: `C354282 autoTestMappingProf_${getRandomPostfix()}`,
          modifications: {
            action: 'Add',
            field: '947',
            ind1: '-',
            ind2: '1',
            subfield: 'a,b',
            subaction: 'Add subfile',
            data: `Test Update.${getRandomPostfix()}`,
            // subaction: '-'
          },
        },
      },
      {
        mappingProfile: {
          typeValue: FOLIO_RECORD_TYPE.HOLDINGS,
          name: `C354282 autotestMappingHoldings_${getRandomPostfix()}`,
          permanentLocation: 'Annex (KU/CC/DI/A)',
        },
      },
    ];

    before('create test data', () => {
      cy.createTempUser([Permissions.settingsDataImportEnabled.gui]).then((userProperties) => {
        user = userProperties;
        cy.login(user.username, user.password);
      });
    });

    it(
      'C354282 Check editing of a job profile with a large set of conditions. (folijet)',
      { tags: [TestTypes.extendedPath, DevTeams.folijet] },
      () => {},
    );
  });
});
