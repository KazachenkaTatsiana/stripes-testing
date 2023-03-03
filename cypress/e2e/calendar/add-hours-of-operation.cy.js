import { deleteServicePoint, createServicePoint, createCalendar,
  openCalendarSettings, deleteCalendar } from '../../support/fragments/calendar/calendar';

import calendarFixtures from '../../support/fragments/calendar/calendar-e2e-test-values';
import PaneActions from '../../support/fragments/calendar/pane-actions';
import CreateCalendarForm from '../../support/fragments/calendar/create-calendar-form';
import TestTypes from '../../support/dictionary/testTypes';
import devTeams from '../../support/dictionary/devTeams';

const testServicePoint = calendarFixtures.servicePoint;
const testCalendar = calendarFixtures.calendar;
const addHoursOfOperationData = calendarFixtures.data.addHoursOfOperation;
const addHoursOfOperationExpectedUIValues = calendarFixtures.expectedUIValues.addHoursOfOperation;


describe('Add new hours of operation for service point', () => {
  let testCalendarResponse;
  before(() => {
    // login and open calendar settings
    openCalendarSettings(false);

    // get admin token to use in okapiRequest to retrieve service points
    if (!Cypress.env('token')) {
      cy.getAdminToken();
    }

    // reset db state
    deleteServicePoint(testServicePoint.id, false);

    // create test service point and calendar
    createServicePoint(testServicePoint, (response) => {
      testCalendar.assignments = [response.body.id];

      createCalendar(testCalendar, (calResponse) => {
        testCalendarResponse = calResponse.body;
      });
      openCalendarSettings();
    });
  });


  after(() => {
    // delete test calendar
    deleteCalendar(testCalendarResponse.id);
  });


  it('C360942 Edit -> Add new hours of operation for service point (bama)', { tags: [TestTypes.smoke, devTeams.bama] }, () => {
    PaneActions.currentCalendarAssignmentsPane.openCurrentCalendarAssignmentsPane();
    PaneActions.currentCalendarAssignmentsPane.selectCalendarByServicePoint(testServicePoint.name);
    PaneActions.currentCalendarAssignmentsPane.clickEditAction(testCalendar.name);


    CreateCalendarForm.addHoursOfOperation(addHoursOfOperationData);

    // intercept http request
    cy.intercept(Cypress.env('OKAPI_HOST') + '/calendar/calendars/' + testCalendarResponse.id, (req) => {
      if (req.method === 'PUT') {
        req.continue((res) => {
          expect(res.statusCode).equals(200);
        });
      }
    }).as('updateCalendar');

    // check that new calendar exists in list of calendars
    cy.wait('@updateCalendar').then(() => {
      openCalendarSettings();
      PaneActions.allCalendarsPane.openAllCalendarsPane();
      PaneActions.allCalendarsPane.selectCalendar(testCalendar.name);

      PaneActions.individualCalendarPane.checkHoursOfOperation({
        calendarName: testCalendar.name,
        addHoursOfOperationExpectedUIValues
      });
    });
  });
});
