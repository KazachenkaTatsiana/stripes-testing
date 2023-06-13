/* eslint-disable cypress/no-unnecessary-waiting */
import {
  Button,
  Select,
  TextField,
  SelectionList,
  Accordion,
  SelectionOption,
  Dropdown
} from '../../../../../interactors';
import { EXISTING_RECORDS_NAMES } from '../../../constants';

const criterionValueTypeList = SelectionList({ id: 'sl-container-criterion-value-type' });
const criterionValueTypeButton = Button({ id:'criterion-value-type' });
const matchProfileDetailsAccordion = Accordion({ id:'match-profile-details' });
const optionsList = {
  instanceHrid: 'Admin data: Instance HRID',
  holdingsHrid: 'Admin data: Holdings HRID',
  itemHrid: 'Admin data: Item HRID',
  pol: 'Acquisitions data: Purchase order line (POL)',
  uri: 'Electronic access: URI',
  instanceUuid: 'Admin data: Instance UUID',
  holdingsPermLoc: 'Location: Permanent',
  itemPermLoc: 'Location: Permanent',
  systemControlNumber: 'Identifier: System control number',
  status: 'Loan and availability: Status',
  barcode: 'Admin data: Barcode'
};

function fillExistingRecordFields(value = '', selector) {
  const map = {
    field: 'profile.matchDetails[0].existingMatchExpression.fields[0].value',
    in1: 'profile.matchDetails[0].existingMatchExpression.fields[1].value',
    in2: 'profile.matchDetails[0].existingMatchExpression.fields[2].value',
    subfield: 'profile.matchDetails[0].existingMatchExpression.fields[3].value'
  };
  cy.do(TextField({ name: map[selector] }).fillIn(value));
}

function fillIncomingRecordFields(value = '', selector) {
  const map = {
    field: 'profile.matchDetails[0].incomingMatchExpression.fields[0].value',
    in1: 'profile.matchDetails[0].incomingMatchExpression.fields[1].value',
    in2: 'profile.matchDetails[0].incomingMatchExpression.fields[2].value',
    subfield: 'profile.matchDetails[0].incomingMatchExpression.fields[3].value'
  };
  cy.do(TextField({ name: map[selector] }).fillIn(value));
}

const fillMatchProfileForm = ({
  profileName,
  incomingRecordFields,
  existingRecordFields,
  matchCriterion,
  existingRecordType,
  instanceOption,
  holdingsOption,
  itemOption
}) => {
  cy.do(TextField('Name*').fillIn(profileName));
  // wait for data to be loaded
  cy.wait(15000);
  // select existing record type
  if (existingRecordType === 'MARC_BIBLIOGRAPHIC') {
    cy.do(Button({ dataId:'MARC_BIBLIOGRAPHIC' }).click());
    fillIncomingRecordFields(incomingRecordFields.field, 'field');
    fillIncomingRecordFields(incomingRecordFields.in1, 'in1');
    fillIncomingRecordFields(incomingRecordFields.in2, 'in2');
    fillIncomingRecordFields(incomingRecordFields.subfield, 'subfield');
    cy.do(Select('Match criterion').choose(matchCriterion));
    fillExistingRecordFields(existingRecordFields.field, 'field');
    fillExistingRecordFields(existingRecordFields.in1, 'in1');
    fillExistingRecordFields(existingRecordFields.in2, 'in2');
    fillExistingRecordFields(existingRecordFields.subfield, 'subfield');
  } else if (existingRecordType === 'INSTANCE') {
    // wait for list with data to be loaded
    cy.wait(1500);
    cy.do(matchProfileDetailsAccordion.find(Button({ dataId:'INSTANCE' })).click());
    fillIncomingRecordFields(incomingRecordFields.field, 'field');
    if (incomingRecordFields.in1) {
      fillIncomingRecordFields(incomingRecordFields.in1, 'in1');
    }
    fillIncomingRecordFields(incomingRecordFields.subfield, 'subfield');
    cy.do(criterionValueTypeButton.click());
    cy.expect(criterionValueTypeList.exists());
    cy.do(SelectionList({ id:'sl-container-criterion-value-type' }).find(SelectionOption(instanceOption)).click());
  } else if (existingRecordType === 'HOLDINGS') {
    // wait for list with data to be loaded
    cy.wait(1500);
    cy.do(matchProfileDetailsAccordion.find(Button({ dataId:'HOLDINGS' })).click());
    fillIncomingRecordFields(incomingRecordFields.field, 'field');
    if (incomingRecordFields.in1) {
      fillIncomingRecordFields(incomingRecordFields.in1, 'in1');
    }
    if (incomingRecordFields.in2) {
      fillIncomingRecordFields(incomingRecordFields.in2, 'in2');
    }
    fillIncomingRecordFields(incomingRecordFields.subfield, 'subfield');
    cy.do(criterionValueTypeButton.click());
    cy.expect(criterionValueTypeList.exists());
    cy.do(SelectionList({ id:'sl-container-criterion-value-type' }).find(SelectionOption(holdingsOption)).click());
  } else {
    cy.do(matchProfileDetailsAccordion.find(Button({ dataId:'ITEM' })).click());
    fillIncomingRecordFields(incomingRecordFields.field, 'field');
    fillIncomingRecordFields(incomingRecordFields.subfield, 'subfield');
    cy.do(criterionValueTypeButton.click());
    cy.expect(criterionValueTypeList.exists());
    // wait for list will be loaded
    cy.wait(2000);
    cy.do(SelectionList({ id:'sl-container-criterion-value-type' }).find(SelectionOption(itemOption)).click());
  }
};

const fillMatchProfileWithExistingPart = ({
  profileName,
  incomingRecordFields,
  matchCriterion,
  instanceOption
}) => {
  cy.do(TextField('Name*').fillIn(profileName));
  // wait for data to be loaded
  cy.wait(15000);
  cy.do(matchProfileDetailsAccordion.find(Button({ dataId:'INSTANCE' })).click());
  fillIncomingRecordFields(incomingRecordFields.field, 'field');
  fillIncomingRecordFields(incomingRecordFields.in1, 'in1');
  fillIncomingRecordFields(incomingRecordFields.in2, 'in2');
  fillIncomingRecordFields(incomingRecordFields.subfield, 'subfield');
  cy.do(Select('Match criterion').choose(matchCriterion));
  cy.do(criterionValueTypeButton.click());
  cy.expect(criterionValueTypeList.exists());
  // wait for list will be loaded
  cy.wait(2000);
  cy.do(SelectionList({ id:'sl-container-criterion-value-type' }).find(SelectionOption(instanceOption)).click());
};

const fillMatchProfileStaticValue = ({ profileName, incomingStaticValue, matchCriterion, itemOption, existingRecordType }) => {
  cy.do(TextField('Name*').fillIn(profileName));
  // wait for data to be loaded
  cy.wait(15000);
  cy.do([
    matchProfileDetailsAccordion.find(Button({ dataId: existingRecordType })).click(),
    Dropdown({ id:'record-selector-dropdown' }).open(),
    Button('Static value (submatch only)').click(),
    TextField({ name:'profile.matchDetails[0].incomingMatchExpression.staticValueDetails.text' }).fillIn(incomingStaticValue),
    Select('Match criterion').choose(matchCriterion),
    criterionValueTypeButton.click()]);
  cy.expect(criterionValueTypeList.exists());
  // wait for list will be loaded
  cy.wait(2000);
  cy.do(SelectionList({ id:'sl-container-criterion-value-type' })
    .find(SelectionOption(itemOption)).click());
};

const fillMatchProfileWithQualifier = ({
  profileName,
  incomingRecordFields,
  existingRecordFields,
  matchCriterion,
  qualifierType,
  qualifierValue
}) => {
  cy.do(TextField('Name*').fillIn(profileName));
  cy.do(matchProfileDetailsAccordion.find(Button({ dataId:'MARC_BIBLIOGRAPHIC' })).click());
  // wait for list will be loaded
  cy.wait(2000);
  fillIncomingRecordFields(incomingRecordFields.field, 'field');
  fillIncomingRecordFields(incomingRecordFields.subfield, 'subfield');
  cy.contains('Incoming MARC Bibliographic record').then(elem => {
    elem.parent()[0].querySelector('input[type="checkbox').click();
  });
  cy.do([
    Select({ name:'profile.matchDetails[0].incomingMatchExpression.qualifier.qualifierType' }).choose(qualifierType),
    TextField({ name:'profile.matchDetails[0].incomingMatchExpression.qualifier.qualifierValue' }).fillIn(qualifierValue)
  ]);
  cy.do(Select('Match criterion').choose(matchCriterion));
  fillExistingRecordFields(existingRecordFields.field, 'field');
  fillExistingRecordFields(existingRecordFields.subfield, 'subfield');
  cy.contains('Existing MARC Bibliographic record').then(elem => {
    elem.parent()[0].querySelector('input[type="checkbox').click();
  });
  cy.do([
    Select({ name:'profile.matchDetails[0].existingMatchExpression.qualifier.qualifierType' }).choose(qualifierType),
    TextField({ name:'profile.matchDetails[0].existingMatchExpression.qualifier.qualifierValue' }).fillIn(qualifierValue)
  ]);
};

export default {
  optionsList,
  fillMatchProfileForm,
  fillMatchProfileWithExistingPart,
  fillMatchProfileStaticValue,
  fillMatchProfileWithQualifier,

  createMatchProfileViaApi:(nameProfile) => {
    return cy
      .okapiRequest({
        method: 'POST',
        path: 'data-import-profiles/matchProfiles',
        body: { profile: { incomingRecordType:'MARC_BIBLIOGRAPHIC',
          matchDetails:[{ incomingRecordType:'MARC_BIBLIOGRAPHIC',
            incomingMatchExpression:{ fields:[{
              label:'field',
              value:'001'
            },
            { label:'indicator1',
              value:'' },
            { label:'indicator2',
              value:'' },
            { 'label':'recordSubfield', 'value':'' }],
            staticValueDetails:null,
            dataValueType:'VALUE_FROM_RECORD' },
            existingRecordType: EXISTING_RECORDS_NAMES.INSTANCE,
            existingMatchExpression:{ fields:[{
              label:'field',
              value:'instance.hrid'
            }],
            dataValueType:'VALUE_FROM_RECORD' },
            matchCriterion:'EXACTLY_MATCHES' }],
          name: nameProfile,
          existingRecordType: EXISTING_RECORDS_NAMES.INSTANCE },
        addedRelations:[],
        deletedRelations:[] },
        isDefaultSearchParamsRequired: false,
      })
      .then(({ response }) => {
        return response;
      });
  },

  createMatchProfileViaApiMarc: (name, incomingRecords, existingRecords) => {
    return cy.okapiRequest({
      method: 'POST',
      path: 'data-import-profiles/matchProfiles',
      body: {
        profile: {
          incomingRecordType: incomingRecords.type,
          matchDetails: [{
            incomingRecordType: incomingRecords.type,
            incomingMatchExpression: {
              fields: [
                {
                  label: 'field',
                  value: incomingRecords.field
                },
                {
                  label: 'indicator1',
                  value: incomingRecords.ind1
                },
                {
                  label: 'indicator2',
                  value: incomingRecords.ind2
                },
                {
                  label: 'recordSubfield', 
                  value: incomingRecords.subfield
                }
              ],
              staticValueDetails: null,
              dataValueType: 'VALUE_FROM_RECORD'
            },
            existingRecordType: existingRecords.type,
            existingMatchExpression: {
              fields: [
                {
                  label: 'field',
                  value: existingRecords.field
                },
                {
                  label: 'indicator1',
                  value: existingRecords.ind1
                },
                {
                  label: 'indicator2',
                  value: existingRecords.ind2
                },
                {
                  label: 'recordSubfield', 
                  value: existingRecords.subfield
                }
              ],
              staticValueDetails: null,
              dataValueType: 'VALUE_FROM_RECORD'
            },
            matchCriterion: 'EXACTLY_MATCHES'
          }],
          name: name,
          existingRecordType: existingRecords.type
        },
        addedRelations: [],
        deletedRelations: []
      },
      isDefaultSearchParamsRequired: false,
    })
      .then(({ response }) => {
        return response;
      });
  },
};
