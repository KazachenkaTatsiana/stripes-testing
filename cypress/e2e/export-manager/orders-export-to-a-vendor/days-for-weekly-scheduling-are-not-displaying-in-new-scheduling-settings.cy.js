import permissions from '../../../support/dictionary/permissions';
import devTeams from '../../../support/dictionary/devTeams';
import TopMenu from '../../../support/fragments/topMenu';
import TestTypes from '../../../support/dictionary/testTypes';
import Users from '../../../support/fragments/users/users';
import Organizations from '../../../support/fragments/organizations/organizations';
import NewOrganization from '../../../support/fragments/organizations/newOrganization';
import getRandomPostfix from '../../../support/utils/stringTools';
import ServicePoints from '../../../support/fragments/settings/tenant/servicePoints/servicePoints';
import NewLocation from '../../../support/fragments/settings/tenant/locations/newLocation';
import DateTools from '../../../support/utils/dateTools';

describe('Export Orders in EDIFACT format: Orders Export to a Vendor', () => {
  const organization = {
    ...NewOrganization.defaultUiOrganizations,
    accounts: [
      {
        accountNo: getRandomPostfix(),
        accountStatus: 'Active',
        acqUnitIds: [],
        appSystemNo: '',
        description: 'Main library account',
        libraryCode: 'COB',
        libraryEdiCode: getRandomPostfix(),
        name: 'TestAccout1',
        notes: '',
        paymentMethod: 'Cash',
      },
    ],
  };
  const integrationName1 = `FirstIntegrationName${getRandomPostfix()}`;
  const integartionDescription1 = 'Test Integation descripton1';
  const vendorEDICodeFor1Integration = getRandomPostfix();
  const libraryEDICodeFor1Integration = getRandomPostfix();
  const UTCTime = DateTools.getUTCDateForScheduling();
  const tomorrow = DateTools.getTomorrowDay();
  const tomorrowDate = DateTools.getFormattedDate({ date: tomorrow }, 'MM/DD/YYYY');
  let user;
  let location;
  let servicePointId;

  before(() => {
    cy.getAdminToken();

    ServicePoints.getViaApi().then((servicePoint) => {
      servicePointId = servicePoint[0].id;
      NewLocation.createViaApi(NewLocation.getDefaultLocation(servicePointId)).then((res) => {
        location = res;
      });
    });

    Organizations.createOrganizationViaApi(organization).then((organizationsResponse) => {
      organization.id = organizationsResponse;
    });
    cy.loginAsAdmin({ path: TopMenu.organizationsPath, waiter: Organizations.waitLoading });
    Organizations.searchByParameters('Name', organization.name);
    Organizations.checkSearchResults(organization);
    Organizations.selectOrganization(organization.name);
    Organizations.addIntegration();
    Organizations.fillIntegrationInformation(
      integrationName1,
      integartionDescription1,
      vendorEDICodeFor1Integration,
      libraryEDICodeFor1Integration,
      organization.accounts[0].accountNo,
      'Purchase',
      UTCTime,
    );

    cy.createTempUser([
      permissions.exportManagerAll.gui,
      permissions.uiOrganizationsIntegrationUsernamesAndPasswordsViewEdit.gui,
      permissions.uiOrganizationsViewEdit.gui,
    ]).then((userProperties) => {
      user = userProperties;
      cy.log(user.username, user.password, {
        path: TopMenu.organizationsPath,
        waiter: Organizations.waitLoading,
      });
    });
  });

  after(() => {
    Organizations.deleteOrganizationViaApi(organization.id);
    NewLocation.deleteViaApiIncludingInstitutionCampusLibrary(
      location.institutionId,
      location.campusId,
      location.libraryId,
      location.id,
    );
    Users.deleteViaApi(user.userId);
  });

  it(
    'C359200: Days previously chosen for weekly scheduling are NOT displaying in new current scheduling settings (thunderjet) (TaaS)',
    { tags: [TestTypes.smoke, devTeams.thunderjet] },
    () => {
      Organizations.searchByParameters('Name', organization.name);
      Organizations.checkSearchResults(organization);
      Organizations.selectOrganization(organization.name);
      Organizations.selectIntegration(integrationName1);
      Organizations.editIntegration();
      Organizations.changeDayOnTommorowInIntegation(tomorrowDate);
      Organizations.closeDetailsPane();
      Organizations.selectIntegration(integrationName1);
      Organizations.checkChangeDayOnTommorowInIntegation(tomorrowDate);
    },
  );
});
