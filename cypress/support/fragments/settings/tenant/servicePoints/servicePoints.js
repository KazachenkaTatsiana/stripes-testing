import uuid from 'uuid';

import getRandomPostfix from '../../../../utils/stringTools';
import { NavListItem, Pane, Button, TextField, KeyValue } from '../../../../../../interactors';

const servicePointsPane = Pane('Service points');
const closeButton = Button({
  icon: 'times',
});
const collapseAllButton = Button('Collapse all');
const generalInfo = Button({
  id: 'accordion-toggle-button-generalInformation',
});
const locationSection = Button({
  id: 'accordion-toggle-button-locationSection',
});

const defaultServicePoint = {
  code: `autotest_code_${getRandomPostfix()}`,
  id: uuid(),
  discoveryDisplayName: `autotest_discovery_display_name_${getRandomPostfix()}`,
  name: `autotest_service_point_name_${getRandomPostfix()}`,
};

const getDefaultServicePoint = ({
  name = `autotest_service_point_name_${getRandomPostfix()}`,
  id = uuid(),
} = {}) => {
  return {
    id,
    name,
    code: `autotest_code_${getRandomPostfix()}`,
    discoveryDisplayName: `autotest_discovery_display_name_${getRandomPostfix()}`,
  };
};

const getDefaultServicePointWithPickUpLocation = ({ name, id } = {}) => {
  return {
    ...getDefaultServicePoint({ name, id }),
    pickupLocation: true,
    holdShelfExpiryPeriod: { intervalId: 'Hours', duration: 1 },
  };
};

export default {
  defaultServicePoint,
  getDefaultServicePoint,
  getDefaultServicePointWithPickUpLocation,
  getViaApi: (searchParams) => cy
    .okapiRequest({
      path: 'service-points',
      searchParams,
    })
    .then(({ body }) => body.servicepoints),

  createViaApi: (servicePointParameters = defaultServicePoint) => cy.okapiRequest({
    path: 'service-points',
    body: servicePointParameters,
    method: 'POST',
    isDefaultSearchParamsRequired: false,
  }),

  deleteViaApi: (servicePointId) => cy.okapiRequest({
    path: `service-points/${servicePointId}`,
    method: 'DELETE',
    isDefaultSearchParamsRequired: false,
  }),

  goToServicePointsTab() {
    cy.do(NavListItem('Tenant').click());
    cy.expect(Pane('Tenant').exists());
    cy.do(NavListItem('Service points').click());
    cy.expect(servicePointsPane.exists());
  },

  createNewServicePoint({ name, code, displayName }) {
    cy.do(Button('+ New').click());
    // UI renders 2 times. There is no way to create good waiter
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.do([
      TextField({ name: 'name' }).fillIn(name),
      TextField({ name: 'code' }).fillIn(code),
      TextField({ name: 'discoveryDisplayName' }).fillIn(displayName),
      Button('Save & close').click(),
    ]);
  },

  servicePointExists(name) {
    cy.expect(servicePointsPane.find(NavListItem(name)).exists());
  },

  editServicePoint({ name, newName, newCode, newDisplayName }) {
    cy.do([
      Button(name).click(),
      Pane(name).find(Button('Edit')).click(),
      TextField({ name: 'name' }).fillIn(newName || name),
    ]);
    if (newCode) cy.do(TextField({ name: 'code' }).fillIn(newCode));
    if (newDisplayName) cy.do(TextField({ name: 'discoveryDisplayName' }).fillIn(newDisplayName));
    cy.do(Button('Save & close').click());
  },

  openServicePointDetails(name) {
    cy.do(Button(name).click());
    cy.expect(Pane(name).exists());
  },

  checkPaneContent({ name, code, discoveryDisplayName }) {
    cy.expect([
      closeButton.exists(),
      collapseAllButton.exists(),
      Button('Edit').absent(),
      KeyValue('Name').has({ value: name }),
      KeyValue('Code').has({ value: code }),
      KeyValue('Discovery display name').has({ value: discoveryDisplayName }),
    ]);
  },

  collapseSection() {
    cy.do(collapseAllButton.click());
    cy.expect(
      Button('Expand all').exists(),
      generalInfo.has({
        ariaExpanded: false,
      }),
      locationSection.has({
        ariaExpanded: false,
      }),
    );
  },

  closeServicePointPane(name) {
    cy.do(closeButton.click());
    cy.expect(Pane(name).absent());
  },
};
