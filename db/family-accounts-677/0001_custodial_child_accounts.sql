-- WR-SPINE-EXPANSION-676 · EXP676-ACCOUNTS · custodial child Loochy accounts.
-- HELD: production DDL is a Chairman action. Validated locally only (validation/run.sh).
--
-- Why: thy_loochy_accounts.owner_user_id is UNIQUE and must reference a real profile.
-- Grandchildren have family_profiles (owned by the Chairman) but no auth user / profile,
-- and minors must not be given invented login identities. This adds a CUSTODIAL_CHILD
-- kind: the guardian/custodian is owner_user_id, the child is the beneficiary through
-- the existing family_profile_id. No UUID is invented; both ends already exist.
--
-- Rules enforced here:
--   PERSONAL       → one per owner, no beneficiary.
--   CUSTODIAL_CHILD→ beneficiary family_profile required, one per child,
--                    cannot become 'active' without a recorded parental-consent reference
--                    and a counsel-clearance reference (Loochy pilot is counsel_review_required).
-- Balances still move only through thy_loochy_transactions (existing trigger untouched).

alter table thy_loochy_accounts
  add column if not exists account_kind text not null default 'PERSONAL',
  add column if not exists parental_consent_ref text,
  add column if not exists counsel_clearance_ref text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'thy_loochy_accounts_kind_check') then
    alter table thy_loochy_accounts add constraint thy_loochy_accounts_kind_check
      check (account_kind in ('PERSONAL','CUSTODIAL_CHILD'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'thy_loochy_accounts_custodial_shape') then
    alter table thy_loochy_accounts add constraint thy_loochy_accounts_custodial_shape
      check ((account_kind = 'PERSONAL' and family_profile_id is null)
          or (account_kind = 'CUSTODIAL_CHILD' and family_profile_id is not null));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'thy_loochy_accounts_custodial_activation') then
    alter table thy_loochy_accounts add constraint thy_loochy_accounts_custodial_activation
      check (account_kind <> 'CUSTODIAL_CHILD' or account_state in ('not_provisioned','pending_review','closed')
          or (parental_consent_ref is not null and counsel_clearance_ref is not null));
  end if;
end $$;

-- Replace one-account-per-owner with one PERSONAL per owner + one CUSTODIAL per child.
alter table thy_loochy_accounts drop constraint if exists thy_loochy_accounts_owner_user_id_key;
create unique index if not exists thy_loochy_accounts_one_personal_per_owner
  on thy_loochy_accounts (owner_user_id) where account_kind = 'PERSONAL';
create unique index if not exists thy_loochy_accounts_one_custodial_per_child
  on thy_loochy_accounts (family_profile_id) where account_kind = 'CUSTODIAL_CHILD';
