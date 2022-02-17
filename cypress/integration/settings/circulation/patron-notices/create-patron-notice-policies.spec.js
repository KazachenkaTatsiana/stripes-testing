import SettingsMenu from '../../../../support/fragments/settingsMenu';
import TestType from '../../../../support/dictionary/testTypes';
import SettingsCirculations from '../../../../support/fragments/circulation/settingsCirculations';
import NewPatronNoticePolicies from '../../../../support/fragments/circulation/newPatronNoticePolicies';

describe('ui-circulation-settings: create patron notice policies', () => {
  const patronNoticePolicy = { ...NewPatronNoticePolicies.defaultUiPatronNoticePolicies };
  beforeEach('login', () => {
    cy.login(Cypress.env('diku_login'), Cypress.env('diku_password'));
    cy.visit(`${SettingsMenu.circulation}${SettingsCirculations.settingsCirculationPath.patronNoticePolicies}`);
  });

  it('C6530 Create notice policy', { tags: [TestType.smoke] }, () => {
    NewPatronNoticePolicies.create(patronNoticePolicy);
    NewPatronNoticePolicies.check(patronNoticePolicy.name);
    NewPatronNoticePolicies.duplicate(patronNoticePolicy);
    NewPatronNoticePolicies.delete(patronNoticePolicy);
    NewPatronNoticePolicies.edit(patronNoticePolicy);
    NewPatronNoticePolicies.check(patronNoticePolicy.name);
    NewPatronNoticePolicies.delete(patronNoticePolicy);
  });
});
