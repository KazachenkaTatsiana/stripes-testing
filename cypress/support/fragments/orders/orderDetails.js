import {
  Button,
  Pane,
  PaneHeader,
  Section,
  KeyValue,
  MultiColumnListCell,
  MultiColumnListRow,
  including,
  Link,
} from '../../../../interactors';
import InteractorsTools from '../../utils/interactorsTools';
import OrderLines from './orderLines';
import OrderLineDetails from './orderLineDetails';
import InventoryInstance from '../inventory/inventoryInstance';
import CreateInvoiceModal from './modals/createInvoiceModal';
import OpenConfirmationModal from './modals/openConfirmationModal';
import UnopenConfirmationModal from './modals/unopenConfirmationModal';
import ExportDetails from '../exportManager/exportDetails';

const orderDetailsPane = Pane({ id: 'order-details' });
const actionsButton = Button('Actions');

const polListingAccordion = Section({ id: 'POListing' });

const exportDetailsSection = orderDetailsPane.find(Section({ id: 'exportDetails' }));

const openPolDetails = (title) => {
  cy.do(polListingAccordion.find(MultiColumnListCell({ content: title })).click());

  OrderLineDetails.waitLoading();

  return OrderLineDetails;
};

export default {
  openPolDetails,
  checkOrderStatus(orderStatus) {
    cy.expect(
      Section({ id: 'POSummary' }).find(KeyValue('Workflow status')).has({ value: orderStatus }),
    );
  },
  expandActionsDropdown() {
    cy.do(
      orderDetailsPane
        .find(PaneHeader({ id: 'paneHeaderorder-details' }).find(actionsButton))
        .click(),
    );
  },
  openOrder({ orderNumber, confirm = true } = {}) {
    this.expandActionsDropdown();
    cy.do(Button('Open').click());

    if (orderNumber) {
      OpenConfirmationModal.verifyModalView({ orderNumber });
    }

    if (confirm) {
      OpenConfirmationModal.confirm();
    }
  },
  unOpenOrder({ orderNumber, checkinItems = false, confirm = true } = {}) {
    this.expandActionsDropdown();
    cy.do(Button('Unopen').click());

    if (orderNumber) {
      UnopenConfirmationModal.verifyModalView({ orderNumber, checkinItems });
    }

    if (confirm) {
      UnopenConfirmationModal.confirm();
    }
  },
  reOpenOrder({ orderNumber, checkMessage = true } = {}) {
    this.expandActionsDropdown();
    cy.do(Button('Reopen').click());

    if (checkMessage) {
      InteractorsTools.checkCalloutMessage(
        `The Purchase order - ${orderNumber} has been successfully reopened`,
      );
    }
  },
  createNewInvoice({ confirm = true } = {}) {
    this.expandActionsDropdown();
    cy.do(Button('New invoice').click());

    CreateInvoiceModal.verifyModalView();

    if (confirm) {
      CreateInvoiceModal.confirm();
    }
  },
  openReceive() {
    cy.do([
      Pane({ id: 'order-details' })
        .find(PaneHeader({ id: 'paneHeaderorder-details' }).find(Button('Actions')))
        .click(),
      Button('Receive').click(),
    ]);
  },
  openExportJobDetails({ rowIndex = 0, columnIndex = 0 } = {}) {
    cy.do(
      exportDetailsSection
        .find(MultiColumnListRow({ rowIndexInParent: `row-${rowIndex}` }))
        .find(MultiColumnListCell({ columnIndex }))
        .find(Link())
        .click(),
    );
    ExportDetails.waitLoading();

    return ExportDetails;
  },
  checkExportDetailsTableContent(records = []) {
    records.forEach((record, index) => {
      if (record.date) {
        cy.expect(
          exportDetailsSection
            .find(MultiColumnListRow({ rowIndexInParent: `row-${index}` }))
            .find(MultiColumnListCell({ columnIndex: 1 }))
            .has({ content: including(record.date) }),
        );
      }
      if (record.fileName) {
        cy.expect(
          exportDetailsSection
            .find(MultiColumnListRow({ rowIndexInParent: `row-${index}` }))
            .find(MultiColumnListCell({ columnIndex: 2 }))
            .has({ content: including(record.fileName) }),
        );
      }
      if (record.configName) {
        cy.expect(
          exportDetailsSection
            .find(MultiColumnListRow({ rowIndexInParent: `row-${index}` }))
            .find(MultiColumnListCell({ columnIndex: 3 }))
            .has({ content: including(record.configName) }),
        );
      }
    });
  },
  checkIsItemsInInventoryCreated(title, location) {
    openPolDetails(title);
    OrderLines.openInstance();
    InventoryInstance.checkIsInstancePresented(title, location);
  },
};
