-- BookStock Manager - multi-tenant Supabase schema
-- Run in a new Supabase project's SQL editor.
create extension if not exists pgcrypto;

create type public.member_role as enum ('owner','manager','stock_manager','cashier','accountant','viewer');
create type public.purchase_status as enum ('draft','ordered','partially_received','received','cancelled');
create type public.transfer_status as enum ('pending','dispatched','received','cancelled');
create type public.stock_movement_type as enum ('purchase','sale','sale_return','purchase_return','transfer_in','transfer_out','damage','loss','adjustment_in','adjustment_out','opening_stock');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  created_at timestamptz not null default now()
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null default 'Uganda',
  currency text not null default 'UGX',
  phone text default '', email text default '', address text default '', tax_id text default '',
  receipt_footer text default 'Thank you for shopping with us.',
  low_stock_default integer not null default 5 check (low_stock_default >= 0),
  plan text not null default 'starter', status text not null default 'active',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.store_members (
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'viewer',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key(store_id,user_id)
);

create table public.branches (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade,
  name text not null, location text default '', active boolean not null default true,
  created_at timestamptz not null default now(), unique(store_id,name)
);
create table public.categories (id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade, name text not null, unique(store_id,name));
create table public.authors (id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade, name text not null);
create table public.publishers (id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade, name text not null);

create table public.books (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade,
  title text not null, isbn text default '', sku text not null, author text default '', publisher text default '', category text not null default 'General',
  description text default '', cost_price numeric(14,2) not null default 0 check(cost_price>=0), selling_price numeric(14,2) not null default 0 check(selling_price>=0),
  reorder_level integer not null default 5 check(reorder_level>=0), cover_path text, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(store_id,sku)
);

create table public.inventory (
  store_id uuid not null references public.stores(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  quantity integer not null default 0 check(quantity>=0), reserved integer not null default 0 check(reserved>=0), damaged integer not null default 0 check(damaged>=0),
  updated_at timestamptz not null default now(), primary key(branch_id,book_id)
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade,
  name text not null, phone text default '', email text default '', address text default '', balance numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);
create table public.customers (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade,
  name text not null, phone text default '', email text default '', organization text default '', notes text default '', created_at timestamptz not null default now()
);

create table public.purchases (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade,
  purchase_no text not null, branch_id uuid not null references public.branches(id), supplier_id uuid not null references public.suppliers(id),
  total numeric(14,2) not null default 0, paid numeric(14,2) not null default 0, status public.purchase_status not null default 'draft',
  created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), unique(store_id,purchase_no)
);
create table public.purchase_items (
  id uuid primary key default gen_random_uuid(), purchase_id uuid not null references public.purchases(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade, book_id uuid not null references public.books(id), quantity integer not null check(quantity>0), unit_cost numeric(14,2) not null check(unit_cost>=0)
);
create table public.purchase_payments (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade,
  purchase_id uuid not null references public.purchases(id) on delete cascade, amount numeric(14,2) not null check(amount>0), method text not null default 'cash', reference text default '', created_at timestamptz not null default now()
);

create table public.sales (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade,
  sale_no text not null, branch_id uuid not null references public.branches(id), customer_id uuid references public.customers(id) on delete set null,
  total numeric(14,2) not null default 0, payment_method text not null default 'cash', reversed boolean not null default false,
  cashier_id uuid not null references auth.users(id), created_at timestamptz not null default now(), unique(store_id,sale_no)
);
create table public.sale_items (
  id uuid primary key default gen_random_uuid(), sale_id uuid not null references public.sales(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade, book_id uuid not null references public.books(id), quantity integer not null check(quantity>0), unit_price numeric(14,2) not null check(unit_price>=0), unit_cost numeric(14,2) not null check(unit_cost>=0)
);
create table public.sale_payments (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade,
  sale_id uuid not null references public.sales(id) on delete cascade, amount numeric(14,2) not null check(amount>0), method text not null, reference text default '', created_at timestamptz not null default now()
);

create table public.stock_transfers (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade,
  transfer_no text not null, from_branch_id uuid not null references public.branches(id), to_branch_id uuid not null references public.branches(id),
  status public.transfer_status not null default 'pending', created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), received_at timestamptz,
  check(from_branch_id<>to_branch_id), unique(store_id,transfer_no)
);
create table public.stock_transfer_items (
  id uuid primary key default gen_random_uuid(), transfer_id uuid not null references public.stock_transfers(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade, book_id uuid not null references public.books(id), quantity integer not null check(quantity>0)
);

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade,
  branch_id uuid not null references public.branches(id), book_id uuid not null references public.books(id),
  quantity integer not null check(quantity<>0), movement_type public.stock_movement_type not null, reference_type text default '', reference_id uuid, reference_no text default '', reason text default '',
  created_by uuid not null references auth.users(id), created_at timestamptz not null default now()
);
create index stock_movements_lookup on public.stock_movements(store_id,branch_id,book_id,created_at desc);

create table public.expense_categories (id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade, name text not null, unique(store_id,name));
create table public.expenses (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade,
  branch_id uuid not null references public.branches(id), category text not null, amount numeric(14,2) not null check(amount>=0), description text default '', created_by uuid not null references auth.users(id), expense_date date not null default current_date, created_at timestamptz not null default now()
);
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade,
  actor_id uuid references auth.users(id), action text not null, entity_type text not null, entity_id text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade, title text not null, body text not null, read_at timestamptz, created_at timestamptz not null default now()
);
create table public.subscriptions (
  store_id uuid primary key references public.stores(id) on delete cascade, plan text not null default 'starter', status text not null default 'trialing', provider text default '', provider_customer_id text, provider_subscription_id text, trial_ends_at timestamptz, current_period_ends_at timestamptz, updated_at timestamptz not null default now()
);

-- membership helpers used by RLS
create or replace function public.is_store_member(target_store uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.store_members m where m.store_id=target_store and m.user_id=auth.uid() and m.active=true);
$$;
create or replace function public.has_store_role(target_store uuid, allowed public.member_role[])
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.store_members m where m.store_id=target_store and m.user_id=auth.uid() and m.active=true and m.role=any(allowed));
$$;

-- New-user profile trigger
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,full_name,email) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.email); return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Store creator automatically becomes owner.
create or replace function public.handle_new_store() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.store_members(store_id,user_id,role) values(new.id,new.created_by,'owner') on conflict do nothing; return new; end; $$;
drop trigger if exists on_store_created on public.stores;
create trigger on_store_created after insert on public.stores for each row execute procedure public.handle_new_store();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.store_members enable row level security;
alter table public.branches enable row level security;
alter table public.categories enable row level security;
alter table public.authors enable row level security;
alter table public.publishers enable row level security;
alter table public.books enable row level security;
alter table public.inventory enable row level security;
alter table public.suppliers enable row level security;
alter table public.customers enable row level security;
alter table public.purchases enable row level security;
alter table public.purchase_items enable row level security;
alter table public.purchase_payments enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.sale_payments enable row level security;
alter table public.stock_transfers enable row level security;
alter table public.stock_transfer_items enable row level security;
alter table public.stock_movements enable row level security;
alter table public.expense_categories enable row level security;
alter table public.expenses enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;
alter table public.subscriptions enable row level security;

create policy profiles_self on public.profiles for all using(id=auth.uid()) with check(id=auth.uid());
create policy stores_read_member on public.stores for select using(public.is_store_member(id) or created_by=auth.uid());
create policy stores_insert_authenticated on public.stores for insert to authenticated with check(created_by=auth.uid());
create policy stores_update_admin on public.stores for update using(public.has_store_role(id,array['owner','manager']::public.member_role[]));
create policy members_read_member on public.store_members for select using(public.is_store_member(store_id));
create policy members_manage_owner on public.store_members for all using(public.has_store_role(store_id,array['owner']::public.member_role[])) with check(public.has_store_role(store_id,array['owner']::public.member_role[]));

-- Standard tenant policies. Read access for active members; writes limited by role.
create policy branches_read on public.branches for select using(public.is_store_member(store_id));
create policy branches_write on public.branches for all using(public.has_store_role(store_id,array['owner','manager']::public.member_role[])) with check(public.has_store_role(store_id,array['owner','manager']::public.member_role[]));
create policy categories_read on public.categories for select using(public.is_store_member(store_id));
create policy categories_write on public.categories for all using(public.has_store_role(store_id,array['owner','manager','stock_manager']::public.member_role[])) with check(public.has_store_role(store_id,array['owner','manager','stock_manager']::public.member_role[]));
create policy authors_read on public.authors for select using(public.is_store_member(store_id));
create policy authors_write on public.authors for all using(public.has_store_role(store_id,array['owner','manager','stock_manager']::public.member_role[])) with check(public.has_store_role(store_id,array['owner','manager','stock_manager']::public.member_role[]));
create policy publishers_read on public.publishers for select using(public.is_store_member(store_id));
create policy publishers_write on public.publishers for all using(public.has_store_role(store_id,array['owner','manager','stock_manager']::public.member_role[])) with check(public.has_store_role(store_id,array['owner','manager','stock_manager']::public.member_role[]));
create policy books_read on public.books for select using(public.is_store_member(store_id));
create policy books_write on public.books for all using(public.has_store_role(store_id,array['owner','manager','stock_manager']::public.member_role[])) with check(public.has_store_role(store_id,array['owner','manager','stock_manager']::public.member_role[]));
create policy inventory_read on public.inventory for select using(public.is_store_member(store_id));
create policy inventory_write on public.inventory for all using(public.has_store_role(store_id,array['owner','manager','stock_manager','cashier']::public.member_role[])) with check(public.has_store_role(store_id,array['owner','manager','stock_manager','cashier']::public.member_role[]));
create policy suppliers_read on public.suppliers for select using(public.is_store_member(store_id));
create policy suppliers_write on public.suppliers for all using(public.has_store_role(store_id,array['owner','manager','stock_manager','accountant']::public.member_role[])) with check(public.has_store_role(store_id,array['owner','manager','stock_manager','accountant']::public.member_role[]));
create policy customers_read on public.customers for select using(public.is_store_member(store_id));
create policy customers_write on public.customers for all using(public.has_store_role(store_id,array['owner','manager','cashier']::public.member_role[])) with check(public.has_store_role(store_id,array['owner','manager','cashier']::public.member_role[]));
create policy purchases_read on public.purchases for select using(public.is_store_member(store_id));
create policy purchases_write on public.purchases for all using(public.has_store_role(store_id,array['owner','manager','stock_manager','accountant']::public.member_role[])) with check(public.has_store_role(store_id,array['owner','manager','stock_manager','accountant']::public.member_role[]));
create policy purchase_items_read on public.purchase_items for select using(public.is_store_member(store_id));
create policy purchase_items_write on public.purchase_items for all using(public.has_store_role(store_id,array['owner','manager','stock_manager','accountant']::public.member_role[])) with check(public.has_store_role(store_id,array['owner','manager','stock_manager','accountant']::public.member_role[]));
create policy purchase_payments_read on public.purchase_payments for select using(public.is_store_member(store_id));
create policy purchase_payments_write on public.purchase_payments for all using(public.has_store_role(store_id,array['owner','manager','accountant']::public.member_role[])) with check(public.has_store_role(store_id,array['owner','manager','accountant']::public.member_role[]));
create policy sales_read on public.sales for select using(public.is_store_member(store_id));
create policy sales_write on public.sales for all using(public.has_store_role(store_id,array['owner','manager','cashier','accountant']::public.member_role[])) with check(public.has_store_role(store_id,array['owner','manager','cashier','accountant']::public.member_role[]));
create policy sale_items_read on public.sale_items for select using(public.is_store_member(store_id));
create policy sale_items_write on public.sale_items for all using(public.has_store_role(store_id,array['owner','manager','cashier']::public.member_role[])) with check(public.has_store_role(store_id,array['owner','manager','cashier']::public.member_role[]));
create policy sale_payments_read on public.sale_payments for select using(public.is_store_member(store_id));
create policy sale_payments_write on public.sale_payments for all using(public.has_store_role(store_id,array['owner','manager','cashier','accountant']::public.member_role[])) with check(public.has_store_role(store_id,array['owner','manager','cashier','accountant']::public.member_role[]));
create policy transfers_read on public.stock_transfers for select using(public.is_store_member(store_id));
create policy transfers_write on public.stock_transfers for all using(public.has_store_role(store_id,array['owner','manager','stock_manager']::public.member_role[])) with check(public.has_store_role(store_id,array['owner','manager','stock_manager']::public.member_role[]));
create policy transfer_items_read on public.stock_transfer_items for select using(public.is_store_member(store_id));
create policy transfer_items_write on public.stock_transfer_items for all using(public.has_store_role(store_id,array['owner','manager','stock_manager']::public.member_role[])) with check(public.has_store_role(store_id,array['owner','manager','stock_manager']::public.member_role[]));
create policy movements_read on public.stock_movements for select using(public.is_store_member(store_id));
create policy movements_write on public.stock_movements for insert with check(public.has_store_role(store_id,array['owner','manager','stock_manager','cashier']::public.member_role[]));
create policy expense_categories_read on public.expense_categories for select using(public.is_store_member(store_id));
create policy expense_categories_write on public.expense_categories for all using(public.has_store_role(store_id,array['owner','manager','accountant']::public.member_role[])) with check(public.has_store_role(store_id,array['owner','manager','accountant']::public.member_role[]));
create policy expenses_read on public.expenses for select using(public.is_store_member(store_id));
create policy expenses_write on public.expenses for all using(public.has_store_role(store_id,array['owner','manager','accountant']::public.member_role[])) with check(public.has_store_role(store_id,array['owner','manager','accountant']::public.member_role[]));
create policy audit_read on public.audit_logs for select using(public.has_store_role(store_id,array['owner','manager']::public.member_role[]));
create policy audit_insert on public.audit_logs for insert with check(public.is_store_member(store_id));
create policy notifications_self on public.notifications for select using(user_id=auth.uid() and public.is_store_member(store_id));
create policy notifications_update_self on public.notifications for update using(user_id=auth.uid() and public.is_store_member(store_id));
create policy subscriptions_owner_read on public.subscriptions for select using(public.has_store_role(store_id,array['owner']::public.member_role[]));

-- Atomic stock adjustment RPC. Use from production mutations instead of direct quantity edits.
create or replace function public.adjust_stock(p_store uuid,p_branch uuid,p_book uuid,p_delta integer,p_type public.stock_movement_type,p_reference text default '',p_reason text default '')
returns integer language plpgsql security invoker as $$
declare current_qty integer; new_qty integer;
begin
  if p_delta=0 then raise exception 'Delta cannot be zero'; end if;
  if not public.has_store_role(p_store,array['owner','manager','stock_manager','cashier']::public.member_role[]) then raise exception 'Not authorized'; end if;
  select quantity into current_qty from public.inventory where store_id=p_store and branch_id=p_branch and book_id=p_book for update;
  current_qty := coalesce(current_qty,0);
  new_qty := current_qty + p_delta;
  if new_qty<0 then raise exception 'Insufficient stock'; end if;
  insert into public.inventory(store_id,branch_id,book_id,quantity) values(p_store,p_branch,p_book,new_qty)
  on conflict(branch_id,book_id) do update set quantity=excluded.quantity,updated_at=now();
  insert into public.stock_movements(store_id,branch_id,book_id,quantity,movement_type,reference_no,reason,created_by)
  values(p_store,p_branch,p_book,p_delta,p_type,p_reference,p_reason,auth.uid());
  return new_qty;
end; $$;
