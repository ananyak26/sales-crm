export type Account = {
  id: string;
  name: string;
  industry: string | null;
  phone: string | null;
  website: string | null;
  billing_address: string | null;
  shipping_address: string | null;
  gstin: string | null;
  state: string | null;
  created_at: string;
};

export type CompanySettings = {
  id: number;
  company_name: string | null;
  address_line: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  gstin: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  bank_account_name: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  default_terms: string | null;
};

export type Contact = {
  id: string;
  account_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
};

export type Lead = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: "New" | "Contacted" | "Qualified" | "Lost";
  source: string | null;
  notes: string | null;
  created_at: string;
};

export type Deal = {
  id: string;
  name: string;
  account_id: string | null;
  contact_id: string | null;
  lead_id: string | null;
  stage: "Prospecting" | "Proposal" | "Negotiation" | "Won" | "Lost";
  amount: number;
  close_date: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  tax_rate: number;
  description: string | null;
  hsn_sac: string | null;
  unit: string | null;
};

export type QuoteItem = {
  id?: string;
  quote_id?: string;
  product_id: string | null;
  description: string;
  hsn_sac?: string | null;
  unit?: string | null;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  line_total: number;
  sort_order?: number;
};

export type Quote = {
  id: string;
  quote_number: string;
  deal_id: string | null;
  account_id: string | null;
  contact_id: string | null;
  status: "Draft" | "Sent" | "Accepted" | "Rejected";
  subtotal: number;
  discount: number;
  tax_total: number;
  grand_total: number;
  valid_until: string | null;
  terms: string | null;
  subject: string | null;
  place_of_supply: string | null;
  tax_type: "IGST" | "CGST_SGST";
  notes: string | null;
  share_token: string;
  created_at: string;
};

export type InvoiceItem = {
  id?: string;
  invoice_id?: string;
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  line_total: number;
};

export type Invoice = {
  id: string;
  invoice_number: string;
  quote_id: string | null;
  account_id: string | null;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  subtotal: number;
  tax_total: number;
  grand_total: number;
  due_date: string | null;
  share_token: string;
  created_at: string;
};
