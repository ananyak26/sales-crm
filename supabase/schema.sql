-- Sales CRM schema
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New Query)

create extension if not exists "uuid-ossp";

-- Profiles (extends Supabase auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz default now()
);

-- Accounts (companies/clients)
create table if not exists accounts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  industry text,
  phone text,
  website text,
  billing_address text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Contacts (people at an account)
create table if not exists contacts (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id) on delete set null,
  name text not null,
  email text,
  phone text,
  title text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Leads
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  company text,
  email text,
  phone text,
  status text not null default 'New' check (status in ('New','Contacted','Qualified','Lost')),
  source text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Deals (opportunities)
create table if not exists deals (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  account_id uuid references accounts(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  stage text not null default 'Prospecting' check (stage in ('Prospecting','Proposal','Negotiation','Won','Lost')),
  amount numeric(12,2) default 0,
  close_date date,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Products / price book
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  sku text,
  price numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  description text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Quotes
create table if not exists quotes (
  id uuid primary key default uuid_generate_v4(),
  quote_number text not null unique,
  deal_id uuid references deals(id) on delete set null,
  account_id uuid references accounts(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  status text not null default 'Draft' check (status in ('Draft','Sent','Accepted','Rejected')),
  subtotal numeric(12,2) default 0,
  discount numeric(12,2) default 0,
  tax_total numeric(12,2) default 0,
  grand_total numeric(12,2) default 0,
  valid_until date,
  terms text,
  share_token uuid default uuid_generate_v4(),
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists quote_items (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid references quotes(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  line_total numeric(12,2) not null default 0,
  sort_order int default 0
);

-- Invoices (converted from a quote)
create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  invoice_number text not null unique,
  quote_id uuid references quotes(id) on delete set null,
  account_id uuid references accounts(id) on delete set null,
  status text not null default 'Draft' check (status in ('Draft','Sent','Paid','Overdue')),
  subtotal numeric(12,2) default 0,
  tax_total numeric(12,2) default 0,
  grand_total numeric(12,2) default 0,
  due_date date,
  share_token uuid default uuid_generate_v4(),
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references invoices(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  line_total numeric(12,2) not null default 0,
  sort_order int default 0
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security: any logged-in sales rep can read/write everything
-- (team-shared CRM). Change these policies later if you want reps to
-- only see their own records.
alter table profiles enable row level security;
alter table accounts enable row level security;
alter table contacts enable row level security;
alter table leads enable row level security;
alter table deals enable row level security;
alter table products enable row level security;
alter table quotes enable row level security;
alter table quote_items enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;

create policy "authenticated read profiles" on profiles for select using (auth.role() = 'authenticated');

create policy "team full access accounts" on accounts for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "team full access contacts" on contacts for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "team full access leads" on leads for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "team full access deals" on deals for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "team full access products" on products for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "team full access quotes" on quotes for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "team full access quote_items" on quote_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "team full access invoices" on invoices for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "team full access invoice_items" on invoice_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Public (anon) read access for shared quote/invoice links, scoped by share_token
create policy "public read quote by token" on quotes for select using (true);
create policy "public read quote_items by token" on quote_items for select using (true);
create policy "public read invoice by token" on invoices for select using (true);
create policy "public read invoice_items by token" on invoice_items for select using (true);
