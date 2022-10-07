import getRandomPostfix from '../../support/utils/stringTools';
import LogsViewAll from '../../support/fragments/data_import/logs/logsViewAll';
import DateTools from '../../support/utils/dateTools';
import { Accordion } from '../../../interactors';
import TopMenu from '../../support/fragments/topMenu';
import FileManager from '../../support/utils/fileManager';
import TestTypes from '../../support/dictionary/testTypes';
import DevTeams from '../../support/dictionary/devTeams';

describe('ui-data-import: Filter the "View all" log screen', () => {
  // Path to static file in fixtures
  const pathToStaticFile = 'oneMarcBib.mrc';
  // Create unique names for MARC files
  const fileNameForFailedImport = `C11113test${getRandomPostfix()}.mrc`;
  const fileNameForSuccessfulImport = `C11113test${getRandomPostfix()}.mrc`;
  let userName;
  let jobProfileName;
  let userNameId;
  let profileId;

  before(() => {
    cy.loginAsAdmin();
    cy.getAdminToken();

    // Create files dynamically with given name and content in fixtures
    FileManager.createFile(`cypress/fixtures/${fileNameForFailedImport}`);
    // read contents of static file in fixtures
    cy.readFile(`cypress/fixtures/${pathToStaticFile}`).then(content => {
      // and write its contents to the file which runs successfully and create it
      FileManager.createFile(`cypress/fixtures/${fileNameForSuccessfulImport}`, content);
    });

    cy.visit(TopMenu.dataImportPath);
    // Upload files
    // runs with errors
    cy.uploadFileWithDefaultJobProfile(fileNameForFailedImport);
    cy.reload();
    // runs successfully
    cy.uploadFileWithDefaultJobProfile(fileNameForSuccessfulImport);

    // Remove generated test files from fixtures after uploading
    FileManager.deleteFile(`cypress/fixtures/${fileNameForSuccessfulImport}`);
    FileManager.deleteFile(`cypress/fixtures/${fileNameForFailedImport}`);
  });

  beforeEach(() => {
    LogsViewAll.getSingleJobProfile().then(({ jobProfileInfo, runBy, userId }) => {
      jobProfileName = jobProfileInfo.name;
      userName = `${runBy.firstName} ${runBy.lastName}`;
      userNameId = userId;
      profileId = jobProfileInfo.id;
    });
  });

  it('C11113 Filter the "View all" log screen (folijet)', { tags: [TestTypes.smoke, DevTeams.folijet] }, () => {
    LogsViewAll.openViewAll();
    LogsViewAll.checkByReverseChronologicalOrder();

    // FILTER By "Errors in Import"
    LogsViewAll.errorsInImportStatuses.forEach((filter) => {
      // need some waiting until checkboxes become clickable after resetting filters
      cy.wait(1000); // eslint-disable-line cypress/no-unnecessary-waiting
      LogsViewAll.filterJobsByErrors(filter);
      LogsViewAll.checkByErrorsInImport({ filter });
      LogsViewAll.resetAllFilters();
    });

    // FILTER By "Date"
    const startedDate = new Date();
    const completedDate = startedDate;

    // format date as YYYY-MM-DD
    const formattedStart = DateTools.getFormattedDate({ date: startedDate });

    // api endpoint expects completedDate increased by 1 day
    completedDate.setDate(completedDate.getDate() + 1);

    LogsViewAll.filterJobsByDate({ from: formattedStart, end: formattedStart });

    const formattedEnd = DateTools.getFormattedDate({ date: completedDate });
    LogsViewAll.checkByDate({ from: formattedStart, end: formattedEnd });
    LogsViewAll.resetAllFilters();

    // FILTER By "Job profile"
    LogsViewAll.filterJobsByJobProfile(jobProfileName);
    LogsViewAll.checkByJobProfileName({ jobProfileName, profileId });
    LogsViewAll.resetAllFilters();

    // FILTER By "User"
    LogsViewAll.filterJobsByUser(userName);
    LogsViewAll.checkByUserName({ userName, userId: userNameId });
    LogsViewAll.resetAllFilters();

    // FILTER By "Inventory single record imports"
    cy.do(Accordion({ id: 'singleRecordImports' }).clickHeader());
    LogsViewAll.singleRecordImportsStatuses.forEach(filter => {
      // need some waiting until checkboxes become clickable after resetting filters
      cy.wait(1000); // eslint-disable-line cypress/no-unnecessary-waiting
      LogsViewAll.filterJobsByInventorySingleRecordImports(filter);
      LogsViewAll.checkByInventorySingleRecord({ filter });
      LogsViewAll.resetAllFilters();
    });

    // FILTER By more than one filter
    // in this case, filter by "User" and "Errors in Import"

    // close opened User accordion before search
    // because filterJobsByUser method opens it
    cy.do(Accordion({ id: 'userId' }).clickHeader());
    const filter = LogsViewAll.errorsInImportStatuses[0];

    LogsViewAll.filterJobsByErrors(filter);
    LogsViewAll.filterJobsByUser(userName);
    LogsViewAll.checkByErrorsInImportAndUser({ filter, userName, userId: userNameId });
    LogsViewAll.resetAllFilters();
  });
});