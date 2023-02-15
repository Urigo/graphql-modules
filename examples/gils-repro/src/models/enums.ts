export enum MissingChargeInfo {
  Counterparty = 'COUNTERPARTY',
  TransactionDescription = 'TRANSACTION_DESCRIPTION',
  Tags = 'TAGS',
  Vat = 'VAT',
  Documents = 'DOCUMENTS',
  LedgerRecords = 'LEDGER_RECORDS',
  Balance = 'BALANCE',
}

export enum ChargeSortByField {
  Date = 'DATE',
  Amount = 'AMOUNT',
  AbsAmount = 'ABS_AMOUNT',
}

export enum TransactionDirection {
  Debit = 'DEBIT',
  Credit = 'CREDIT',
}

export enum Currency {
  Usd = 'USD',
  Ils = 'ILS',
  Gbp = 'GBP',
  Eur = 'EUR',
}

export enum DocumentType {
  Invoice = 'INVOICE',
  Receipt = 'RECEIPT',
  InvoiceReceipt = 'INVOICE_RECEIPT',
  Proforma = 'PROFORMA',
  Unprocessed = 'UNPROCESSED',
}
