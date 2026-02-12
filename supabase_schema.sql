-- Create the purchases table to track sales
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Customer Details
  customer_email text not null,
  stripe_session_id text unique not null,
  
  -- Product Details
  price_id text not null,   -- Which price/product was bought
  
  -- Fulfillment Status
  is_verified boolean default true,  -- If this row exists, payment succeeded
  download_count int default 0,      -- Optional: limit downloads
  last_downloaded_at timestamp with time zone
);

-- Enable Row Level Security (RLS)
alter table public.purchases enable row level security;

-- Create policy to allow Service Role (our backend) to do anything
-- Users generally won't access this table directly in this architecture, 
-- but if they did (e.g. login), they should only see their own.
create policy "Enable full access for service role"
on public.purchases
for all
to service_role
using (true)
with check (true);
