import localforage from 'localforage';
import { Button, Link, Modal, MultiColumnListCell, Pane } from '../../../../interactors';


export const openCalendarSettings = (isLoggedIn = true) => {
  if (!isLoggedIn) {
    cy.loginAsAdmin();
  }
  cy.visit('settings/calendar');
};

export const deleteCalendarUI = (calendarName) => {
  openCalendarSettings();
  cy.do(
    Pane('Calendar').find(Link('All calendars')).click()
  );

  cy.do(
    Pane('All calendars').find(MultiColumnListCell(calendarName)).exists()
  );

  cy.do([
    Pane('All calendars').find(MultiColumnListCell(calendarName)).click(),
    Pane(calendarName).clickAction('Delete'),
    Modal('Confirm deletion').find(Button('Delete')).click(),
    Pane('All calendars').find(MultiColumnListCell(calendarName)).absent()
  ]);
};

export const createCalendar = (testCalendarRequestBody, callback = null) => {
  cy.wrap(localforage.getItem('okapiSess')).then((okapiSess) => {
    expect(okapiSess).to.have.property('token');
    cy.request({
      url: Cypress.env('OKAPI_HOST') + '/calendar/calendars',
      method: 'POST',
      body: testCalendarRequestBody,
      headers: {
        'x-okapi-tenant': Cypress.env('okapi_tenant'),
        'x-okapi-token': okapiSess.token
      },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 409) {
        deleteCalendarUI(testCalendarRequestBody.name);
        createCalendar(testCalendarRequestBody, callback);
      } else {
        expect(response.status).equals(201);
        if (callback != null) {
          callback(response);
        }
      }
    });
  });
};

export const deleteCalendar = (calendarID, callback = null) => {
  cy.okapiRequest({
    method: 'DELETE',
    path: 'calendar/calendars/' + calendarID,
  }).then((response) => {
    expect(response.status).equals(204);
    if (callback) { callback(response); }
  });
};



export const createServicePoint = (testServicePointRequestBody, callback) => {
  cy.okapiRequest({
    method: 'POST',
    path: 'service-points',
    body: testServicePointRequestBody,
  }).then((response) => {
    expect(response.status).equals(201);
    if (callback) { callback(response); }
  });
};

export const deleteServicePoint = (servicePointID, checkStatusCode = true, callback = null) => {
  cy.wrap(localforage.getItem('okapiSess')).then(okapiSess => {
    expect(okapiSess).to.have.property('token');
    cy.request({
      url: Cypress.env('OKAPI_HOST') + '/service-points/' + servicePointID,
      method: 'DELETE',
      headers: {
        'x-okapi-tenant': Cypress.env('OKAPI_TENANT'),
        'x-okapi-token': okapiSess.token
      },
      failOnStatusCode: false,
    }).then((response) => {
      if (checkStatusCode) {
        expect(response.status).equals(204);
      } else {
        expect(response.status).oneOf([204, 404]);
      }
      if (callback) { callback(response); }
    });
  });
};

