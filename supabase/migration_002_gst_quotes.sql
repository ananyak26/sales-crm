-- Migration 002: Zoho-style GST quote layout
-- Run this in the Supabase SQL Editor AFTER schema.sql (safe to run once).

-- Company profile (your own letterhead info - single row used on every quote)
create table if not exists company_settings (
  id int primary key default 1,
  company_name text,
  address_line text,
  city text,
  state text,
  pincode text,
  country text default 'India',
  gstin text,
  phone text,
  email text,
  website text,
  logo_url text,
  bank_account_name text,
  bank_name text,
  bank_account_number text,
  bank_ifsc text,
  default_terms text,
  constraint single_row check (id = 1)
);
insert into company_settings (id) values (1) on conflict (id) do nothing;

alter table company_settings enable row level security;
create policy if not exists "team read company_settings" on company_settings for select using (auth.role() = 'authenticated');
create policy if not exists "team update company_settings" on company_settings for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy if not exists "public read company_settings" on company_settings for select using (true);

-- Accounts: GST + state + shipping address (needed for IGST vs CGST/SGST + Place of Supply)
alter table accounts add column if not exists gstin text;
alter table accounts add column if not exists state text;
alter table accounts add column if not exists shipping_address text;

-- Products: HSN/SAC code + unit
alter table products add column if not exists hsn_sac text;
alter table products add column if not exists unit text default 'Nos';

-- Quotes: subject line, place of supply, tax type (IGST vs CGST+SGST)
alter table quotes add column if not exists subject text;
alter table quotes add column if not exists place_of_supply text;
alter table quotes add column if not exists tax_type text default 'IGST' check (tax_type in ('IGST','CGST_SGST'));
alter table quotes add column if not exists notes text;

-- Quote items: HSN/SAC + unit, carried over from the product at time of quoting
alter table quote_items add column if not exists hsn_sac text;
alter table quote_items add column if not exists unit text default 'Nos';

-- Invoices: same additions for consistency when converting from a quote
alter table invoices add column if not exists place_of_supply text;
alter table invoices add column if not exists tax_type text default 'IGST' check (tax_type in ('IGST','CGST_SGST'));
alter table invoice_items add column if not exists hsn_sac text;
alter table invoice_items add column if not exists unit text default 'Nos';
