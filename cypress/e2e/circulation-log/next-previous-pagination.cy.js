import { DevTeams, Permissions, TestTypes } from '../../support/dictionary';
import SearchPane from '../../support/fragments/circulation-log/searchPane';
import SearchResults from '../../support/fragments/circulation-log/searchResults';
import TopMenu from '../../support/fragments/topMenu';
import Users from '../../support/fragments/users/users';

describe('Circulation log', () => {
  const testData = {};

  before('Create test data', () => {
    cy.getAdminToken();

    cy.createTempUser([Permissions.circulationLogAll.gui]).then((userProperties) => {
      testData.user = userProperties;
      cy.login(testData.user.username, testData.user.password);
    });
  });

  after('Delete test data', () => {
    Users.deleteViaApi(testData.user.userId);
  });

  it(
    'C365129 Verify "Next" and "Previous" pagination Circulation log (volaris)',
    { tags: [TestTypes.criticalPath, DevTeams.volaris] },
    () => {
      cy.visit(TopMenu.circulationLogPath);
      SearchPane.waitLoading();
      // verify The "Search & filter" pane details
      SearchPane.verifyResetAllButtonIsDisabled();
      SearchPane.verifyUserBarcodeTextFieldExists();
      SearchPane.verifyPatronLookupButtonExists();
      SearchPane.verifyItemBarcodeTextFieldExists();
      SearchPane.verifyDescriptionTextFieldExists();
      SearchPane.verifyApplyMainFilterButtonExists();
      SearchPane.verifySevicePointDropdownExists();
      SearchPane.verifyLoanAccordionExistsAndCollapsed();
      SearchPane.verifyNoticeAccordionExistsAndCollapsed();
      SearchPane.verifyFeeFineAccordionExistsAndCollapsed();
      SearchPane.verifyRequestAccordionExistsAndCollapsed();
      // filter results for one year period
      SearchPane.filterByLastYear();
      SearchResults.checkNumberOfRows(100);
      SearchResults.verifyPreviousPageButtonIsDisabled();
      SearchResults.verifyNextPageButtonIsEnabled();
      SearchResults.verifyFoundEntries('1 - 100');
      // next page
      SearchResults.clickNextPageButton();
      SearchResults.checkNumberOfRows(100);
      SearchResults.verifyPreviousPageButtonIsEnabled();
      SearchResults.verifyNextPageButtonIsEnabled();
      SearchResults.verifyFoundEntries('101 - 200');
      // previous page
      SearchResults.clickPreviousPageButton();
      SearchResults.checkNumberOfRows(100);
      SearchResults.verifyPreviousPageButtonIsDisabled();
      SearchResults.verifyNextPageButtonIsEnabled();
      SearchResults.verifyFoundEntries('1 - 100');
      // search by marked as missing
      SearchPane.setFilterOptionFromAccordion('loan', 'Marked as missing');
      cy.wait(1000);
      SearchResults.getNumberOfFoundEntriesInHeader().then((subtitleNumberValue) => {
        SearchResults.checkNumberOfRows(parseInt(subtitleNumberValue, 10));
        SearchResults.verifyPreviousPageButtonIsDisabled();
        SearchResults.verifyNextPageButtonIsDisabled();
        SearchResults.verifyFoundEntries(`1 - ${subtitleNumberValue}`);
      });
    },
  );
});
