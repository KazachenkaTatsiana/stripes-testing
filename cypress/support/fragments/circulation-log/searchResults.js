import { matching } from 'bigtest';
import {
  MultiColumnList,
  MultiColumnListCell,
  Link,
  MultiColumnListHeader,
  including,
  MultiColumnListRow,
  Button,
  DropdownMenu,
  Pane,
} from '../../../../interactors';

const resultTable = MultiColumnList({ id: 'circulation-log-list' });
const previousPageButton = Button('Previous');
const nextPageButton = Button('Next');

export default {
  clickOnCell(content, row) {
    cy.do(MultiColumnListCell({ content, row }).find(Link()).click());
  },

  checkTableWithoutLinks() {
    cy.expect(resultTable.find(Link()).absent());
  },

  checkTableWithoutColumns(columns) {
    return cy.wrap(Object.values(columns)).each((columnToCheck) => {
      cy.expect(
        resultTable.find(MultiColumnListHeader({ content: including(columnToCheck) })).absent(),
      );
    });
  },

  chooseActionByRow(rowIndex, actionName) {
    cy.do([
      MultiColumnListRow({ indexRow: `row-${rowIndex}` })
        .find(Button({ icon: 'ellipsis' }))
        .click(),
      DropdownMenu().find(Button(actionName)).click(),
    ]);
  },

  getBilledDate(rowIndex) {
    const dateRegEx = /\d{1,2}\/\d{1,2}\/\d{4},\s\d{1,2}:\d{2}\s\w{2}/gm;
    // Locate the cell with matching content
    const cell = MultiColumnListRow({ indexRow: `row-${rowIndex}` }).find(
      MultiColumnListCell({ content: matching(dateRegEx) }),
    );
    return cy.wrap(cell).invoke('content');
  },

  checkNumberOfRows(numberOfRows) {
    cy.expect(resultTable.has({ rowCount: numberOfRows }));
  },

  verifyPreviousPageButtonIsDisabled() {
    cy.expect(previousPageButton.is({ disabled: true }));
  },

  verifyPreviousPageButtonIsEnabled() {
    cy.expect(previousPageButton.is({ disabled: false }));
  },

  verifyNextPageButtonIsDisabled() {
    cy.expect(nextPageButton.is({ disabled: true }));
  },

  verifyNextPageButtonIsEnabled() {
    cy.expect(nextPageButton.is({ disabled: false }));
  },

  clickNextPageButton() {
    cy.do(nextPageButton.click());
  },

  clickPreviousPageButton() {
    cy.do(previousPageButton.click());
  },

  verifyFoundEntries(expectedValue) {
    cy.get('[class*="prevNextPaginationContainer"] div')
      .invoke('text')
      .then((text) => {
        cy.expect(text).eq(expectedValue);
      });
  },

  verifyFirstCirculationIsInFocus() {
    cy.expect(resultTable.find(MultiColumnListRow({ indexRow: 'row-0' })).is({ visible: true }));
  },

  getNumberOfFoundEntriesInHeader() {
    return cy
      .wrap(Pane({ index: 1 }))
      .invoke('subtitle')
      .then((subtitle) => subtitle.match(/\d+/)[0]);
  },
};
