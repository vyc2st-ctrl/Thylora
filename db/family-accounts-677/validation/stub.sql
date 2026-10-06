-- Minimal stand-ins for the production tables this migration touches. Never touches the backend.
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key);
create table if not exists profiles (user_id uuid primary key references auth.users(id), account_state text not null default 'active');
create table if not exists family_profiles (id uuid primary key, family_id text unique not null, owner_user_id uuid not null references profiles(user_id));
create table if not exists thy_loochy_accounts (
  id uuid primary key default gen_random_uuid(), account_id text unique not null,
  owner_user_id uuid not null unique references profiles(user_id),
  family_profile_id uuid references family_profiles(id) on delete set null,
  account_state text not null check (account_state in ('not_provisioned','pending_review','active','held','closed')),
  available_balance bigint not null default 0 check (available_balance >= 0),
  held_balance bigint not null default 0 check (held_balance >= 0));
insert into auth.users values ('00000000-0000-0000-0000-0000000000c0') on conflict do nothing;
insert into profiles values ('00000000-0000-0000-0000-0000000000c0') on conflict do nothing;
insert into family_profiles values ('00000000-0000-0000-0000-0000000000a1','FAM-TEST-CHILD-A','00000000-0000-0000-0000-0000000000c0'),
                                   ('00000000-0000-0000-0000-0000000000a2','FAM-TEST-CHILD-B','00000000-0000-0000-0000-0000000000c0') on conflict do nothing;
insert into thy_loochy_accounts (account_id, owner_user_id, account_state) values ('ACCT-CUSTODIAN-PERSONAL','00000000-0000-0000-0000-0000000000c0','pending_review') on conflict do nothing;
