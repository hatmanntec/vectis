-- =====================================================================
-- 0012 · Audit trail
-- ---------------------------------------------------------------------
-- Every change to CMS content is recorded automatically by the database:
-- who made it, what was done, to which record, when, and what changed.
-- Because the database does this itself, no screen or code path can
-- "forget" to log a change. Entries can never be edited or deleted
-- through the website or the public API.
-- =====================================================================

create table public.audit_logs (
  id            bigint generated always as identity primary key,
  occurred_at   timestamptz not null default now(),
  actor_id      uuid,          -- the administrator (empty = system / SQL Editor)
  actor_email   text,
  action        public.audit_action not null,
  table_name    text not null,
  record_id     uuid,
  record_label  text,          -- a readable name, e.g. the company name
  changes       jsonb          -- insert: new values · update: {field: {old, new}} · delete: old values
);

create index audit_logs_occurred_at_idx on public.audit_logs (occurred_at desc);
create index audit_logs_record_idx      on public.audit_logs (table_name, record_id);
create index audit_logs_actor_idx       on public.audit_logs (actor_id);


create function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_row  jsonb;
  new_row  jsonb;
  row_data jsonb;
  diff     jsonb;
begin
  if tg_op in ('UPDATE', 'DELETE') then old_row := to_jsonb(old); end if;
  if tg_op in ('INSERT', 'UPDATE') then new_row := to_jsonb(new); end if;
  row_data := coalesce(new_row, old_row);

  if tg_op = 'UPDATE' then
    -- Only the fields that actually changed.
    select jsonb_object_agg(k, jsonb_build_object('old', old_row -> k, 'new', new_row -> k))
      into diff
      from jsonb_object_keys(new_row) as k
     where k not in ('updated_at', 'updated_by')
       and (old_row -> k) is distinct from (new_row -> k);
    if diff is null then
      return null;  -- nothing meaningful changed
    end if;
  elsif tg_op = 'INSERT' then
    diff := new_row - array['created_at', 'updated_at', 'created_by', 'updated_by'];
  else
    diff := old_row;
  end if;

  insert into public.audit_logs (actor_id, actor_email, action, table_name, record_id, record_label, changes)
  values (
    auth.uid(),
    auth.jwt() ->> 'email',
    lower(tg_op)::public.audit_action,
    tg_table_name,
    case
      when row_data ->> 'id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        then (row_data ->> 'id')::uuid
    end,
    left(coalesce(
      row_data ->> 'name',
      row_data ->> 'title',
      row_data ->> 'full_name',
      row_data ->> 'file_name',
      row_data ->> 'site_name',
      row_data ->> 'page_key'
    ), 200),
    diff
  );

  return null;
end;
$$;


-- Attach the audit trigger to every CMS table.
do $$
declare
  t text;
begin
  foreach t in array array[
    'admin_profiles', 'media', 'website_settings', 'sectors',
    'companies', 'company_sectors',
    'investments', 'investment_private_details', 'company_relationships',
    'projects', 'project_milestones',
    'news', 'news_companies',
    'leadership', 'leadership_affiliations',
    'pages', 'media_links'
  ]
  loop
    execute format(
      'create trigger audit after insert or update or delete on public.%I
         for each row execute function public.write_audit_log()', t);
  end loop;
end;
$$;

-- Enquiries come from the public, so only their deletion is audited.
create trigger audit after delete on public.enquiries
  for each row execute function public.write_audit_log();
