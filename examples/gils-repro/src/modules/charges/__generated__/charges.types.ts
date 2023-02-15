/** Types generated for queries found in "src/modules/charges/providers/charges.provider.ts" */
export type currency = 'EUR' | 'GBP' | 'GRT' | 'ILS' | 'USD' | 'USDC';

export type stringArray = string[];

/** 'GetChargesByIds' parameters type */
export interface IGetChargesByIdsParams {
  cahrgeIds: readonly (string | null | void)[];
}

/** 'GetChargesByIds' return type */
export interface IGetChargesByIdsResult {
  account_number: string;
  account_type: string;
  bank_description: string;
  bank_reference: string;
  business_trip: string | null;
  contra_currency_code: number | null;
  currency_code: currency;
  currency_rate: string;
  current_balance: string;
  debit_date: Date | null;
  detailed_bank_description: string;
  event_amount: string;
  event_date: Date;
  event_number: string | null;
  financial_accounts_to_balance: string | null;
  financial_entity: string | null;
  hashavshevet_id: number | null;
  id: string;
  interest: string | null;
  is_conversion: boolean;
  is_property: boolean;
  links: stringArray | null;
  original_id: string;
  personal_category: string | null;
  proforma_invoice_file: string | null;
  receipt_date: Date | null;
  receipt_image: string | null;
  receipt_number: string | null;
  receipt_url: string | null;
  reviewed: boolean | null;
  tax_category: string | null;
  tax_invoice_amount: string | null;
  tax_invoice_currency: currency | null;
  tax_invoice_date: Date | null;
  tax_invoice_file: string | null;
  tax_invoice_number: string | null;
  user_description: string | null;
  vat: number | null;
  withholding_tax: number | null;
}

/** 'GetChargesByIds' query type */
export interface IGetChargesByIdsQuery {
  params: IGetChargesByIdsParams;
  result: IGetChargesByIdsResult;
}
