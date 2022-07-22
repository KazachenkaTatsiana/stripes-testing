import TopMenu from '../../support/fragments/topMenu';
import NewInvoice from '../../support/fragments/invoices/newInvoice';
import NewInvoiceLine from '../../support/fragments/invoices/newInvoiceLine';
import Invoices from '../../support/fragments/invoices/invoices';
import TestType from '../../support/dictionary/testTypes';
import VendorAddress from '../../support/fragments/invoices/vendorAddress';
import NewFund from '../../support/fragments/finance/funds/newFund';
import Funds from '../../support/fragments/finance/funds/funds';
import DateTools from '../../support/utils/dateTools';
import FileManager from '../../support/utils/fileManager';
import SettingsInvoices from '../../support/fragments/invoices/settingsInvoices';
import Organizations from '../../support/fragments/organizations/organizations';
import devTeams from '../../support/dictionary/devTeams';

describe('ui-invoices-settings: Export batch voucher', () => {
  const invoice = { ...NewInvoice.defaultUiInvoice };
  const vendorPrimaryAddress = { ...VendorAddress.vendorAddress };
  const invoiceLine = { ...NewInvoiceLine.defaultUiInvoiceLine };
  const fund = { ...NewFund.defaultFund };
  const subtotalValue = 100;
  const batchGroupConfiguration = {
    batchGroupId: '',
    format: 'Application/json',
    enableScheduledExport: false
  };

  before(() => {
    cy.getToken(Cypress.env('diku_login'), Cypress.env('diku_password'));
    Organizations.getOrganizationViaApi({ query: `name=${invoice.vendorName}` })
      .then(organization => {
        invoice.accountingCode = organization.erpCode;
        Object.assign(vendorPrimaryAddress,
          organization.addresses.find(address => address.isPrimary === true));
      });
    cy.getBatchGroups()
      .then(batchGroup => {
        invoice.batchGroup = batchGroup.name;
        batchGroupConfiguration.batchGroupId = batchGroup.id;
      });
    SettingsInvoices.setConfigurationBatchGroup(batchGroupConfiguration);
    Funds.createFundViaUI(fund)
      .then(
        () => {
          Funds.addBudget(100);
          Funds.checkCreatedBudget(fund.code, DateTools.getCurrentFiscalYearCode());
        }
      );
    invoiceLine.subTotal = -subtotalValue;
    cy.visit(TopMenu.invoicesPath);
  });

  after('Delete storage', () => {
    FileManager.deleteFolder(Cypress.config('downloadsFolder'));
  });

  it('C10943 Run batch voucher export manually (thunderjet)', { tags: [TestType.smoke, devTeams.thunderjet, TestType.broken] }, () => {
    Invoices.createDefaultInvoice(invoice, vendorPrimaryAddress);
    Invoices.createInvoiceLine(invoiceLine);
    Invoices.addFundDistributionToLine(invoiceLine, fund);
    Invoices.approveInvoice();
    Invoices.voucherExport();
    FileManager.findDownloadedFilesByMask('*.json');
  });
});
