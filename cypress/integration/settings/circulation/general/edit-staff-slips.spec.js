import TestType from '../../../../support/dictionary/testTypes';
import EditStaffClips from '../../../../support/fragments/circulation/editStaffClips';
import SettingsMenu from '../../../../support/fragments/settingsMenu';

describe('ui-circulation-settings: Edit Staff slip settings', () => {
  const editStaffClipsHold = { ...EditStaffClips.defaultUiEditStaffClips };
  beforeEach('login', () => {
    cy.login(Cypress.env('diku_login'), Cypress.env('diku_password'));
    cy.visit(`${SettingsMenu.circulationStaffSlipsPath}`);
  });

  it('C347901 Staff clips settings', { tags: [TestType.smoke] }, () => {
    EditStaffClips.editHold(editStaffClipsHold);
    EditStaffClips.fillAndPreviewTemplate();
    EditStaffClips.editPickslip(editStaffClipsHold);
    EditStaffClips.fillAndPreviewTemplate();
    EditStaffClips.editRequestDelivery(editStaffClipsHold);
    EditStaffClips.fillAndPreviewTemplate();
    EditStaffClips.editTransit(editStaffClipsHold);
    EditStaffClips.fillAndPreviewTemplate();
    EditStaffClips.editAndClearHold();
    EditStaffClips.editAndClearPickslip();
    EditStaffClips.editAndClearRequestDelivery();
    EditStaffClips.editAndClearTransit();
  });
});
