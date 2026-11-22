-- =====================================================================
-- 0017 · Saving a company's sectors in one step
-- ---------------------------------------------------------------------
-- set_company_sectors() replaces a company's list of sectors and its
-- primary sector in a single database transaction, so the list can never
-- be left half-saved.
--
-- "security invoker" means it runs with the caller's own permissions: the
-- normal Row Level Security rules apply, and it also checks is_admin().
-- =====================================================================

create function public.set_company_sectors(
  p_company_id         uuid,
  p_sector_ids         uuid[],
  p_primary_sector_id  uuid default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_ids uuid[] := coalesce(p_sector_ids, '{}');
begin
  if not public.is_admin() then
    raise exception 'Only administrators can change sectors.' using errcode = '42501';
  end if;
  if p_primary_sector_id is not null and not (p_primary_sector_id = any (v_ids)) then
    raise exception 'The primary sector must be one of the chosen sectors.' using hint = 'primary_not_chosen';
  end if;

  delete from public.company_sectors
  where company_id = p_company_id
    and not (sector_id = any (v_ids));

  insert into public.company_sectors (company_id, sector_id, is_primary)
  select p_company_id, s, false
  from unnest(v_ids) as s
  on conflict (company_id, sector_id) do nothing;

  -- Clear the old primary first, then set the new one (only one may exist).
  update public.company_sectors
  set is_primary = false
  where company_id = p_company_id and is_primary and sector_id is distinct from p_primary_sector_id;

  if p_primary_sector_id is not null then
    update public.company_sectors
    set is_primary = true
    where company_id = p_company_id and sector_id = p_primary_sector_id and not is_primary;
  end if;
end;
$$;

revoke execute on function public.set_company_sectors(uuid, uuid[], uuid) from public, anon;
grant execute on function public.set_company_sectors(uuid, uuid[], uuid) to authenticated;
