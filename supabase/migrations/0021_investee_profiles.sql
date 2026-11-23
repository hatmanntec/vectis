-- =====================================================================
-- VECTIS: profiles for the two companies invested in.
--   Pillar Oil Limited  (source: pillaroil.com.ng, read November 2026)
--   Akata Energy Limited (source: the company's own Company & Asset
--                         Profile, dated December 2023)
--
-- Nothing here is invented: every statement comes from one of those two
-- sources. Deliberately left out, because they are either forward-looking
-- or likely to be out of date, and are the client's to confirm before
-- they appear in public:
--   * Akata's exact equity percentages in each field
--   * reserve and volume estimates (GCA, Dharmathan, STOOIIP, GIIP)
--   * projected production rates
--   * the Equatorial Guinea block EG 23 bid
--
-- These are investments, not holdings: nothing below says or implies that
-- VECTIS owns or controls either company.
--
-- Safe to run again: it updates the rows in place and changes nothing else.
-- All text uses $v$ quoting, so copying can't break it.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. The companies themselves (contact details and website).
-- ---------------------------------------------------------------------

update public.companies set
  short_description = $v$An independent, wholly Nigerian oil and gas exploration and development company, incorporated in 1997.$v$,
  established_year  = 1997,
  website           = $v$https://pillaroil.com.ng$v$,
  phone             = $v$0201 6309534$v$,
  address           = $v$4 Justice Rose Ukeje Street, Lekki, Lagos, Nigeria$v$,
  updated_at        = now()
where slug = $v$pillar-oil$v$;

update public.companies set
  short_description = $v$An indigenous petroleum development company with equity interests in proven shallow-water fields on OML 95, offshore the western Niger Delta.$v$,
  website           = $v$https://www.akataenergyltd.com$v$,
  phone             = $v$+234 803 332 3597$v$,
  address           = $v$2B Anambra Crescent, Maitama, Abuja, Nigeria$v$,
  updated_at        = now()
where slug = $v$akata-energy$v$;

-- ---------------------------------------------------------------------
-- 2. Pillar Oil: the public investment page.
-- ---------------------------------------------------------------------

update public.investments set
  summary = $v$An independent, wholly Nigerian oil and gas exploration and development company, incorporated in 1997 and active across the upstream, midstream and downstream segments.$v$,
  seo_description = $v$Pillar Oil Limited: an independent Nigerian oil and gas exploration and development company, and a VECTIS investment.$v$,
  description = $v${
    "type": "doc",
    "content": [
      {"type": "paragraph", "content": [{"type": "text", "text": "Pillar Oil Limited is an independent and wholly Nigerian energy exploration and development company. It was incorporated on 10 July 1997 and works from a head office in Lekki, Lagos, with activity in Lagos and Delta States."}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "The company explores for and commercially develops crude oil and natural gas, and describes its approach as doing so efficiently and with care for the environment, for the benefit of its stakeholders and the communities that host its operations."}]},
      {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Assets and operations"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Pillar Oil reports three upstream licences:"}]},
      {"type": "bulletList", "content": [
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "PML 17"}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "OPL 233"}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "PPL 201"}]}]}
      ]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Alongside upstream exploration and production, the company lists midstream and downstream activity among its operating segments."}]},
      {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Standards and host communities"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Pillar Oil states that it manages its relationships with host communities through dialogue and engagement, and that it assesses the environmental, social and economic effects of what it does. It operates under the Nigerian industry regulators: the NUPRC, the NMDPRA and the NCDMB."}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Its stated vision is to become the leading independent energy company in Nigeria, run sustainably and responsibly. Its stated values are professionalism, integrity, loyalty, leadership, accountability and respect."}]}
    ]
  }$v$::jsonb,
  updated_at = now()
where slug = $v$pillar-oil$v$;

-- ---------------------------------------------------------------------
-- 3. Akata Energy: the public investment page.
-- ---------------------------------------------------------------------

update public.investments set
  summary = $v$An indigenous petroleum development company holding equity interests in four proven shallow-water fields on OML 95, offshore the western Niger Delta.$v$,
  seo_description = $v$Akata Energy Limited: an indigenous petroleum development company on OML 95, offshore the western Niger Delta, and a VECTIS investment.$v$,
  description = $v${
    "type": "doc",
    "content": [
      {"type": "paragraph", "content": [{"type": "text", "text": "Akata Energy Limited is an indigenous petroleum development company holding equity interests in proven fields in the shallow-water Niger Delta. It works from Maitama, Abuja, and brings together a team with decades of technical, operational and commercial experience in exploration and production."}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Its interests cover four fields — Meta, Mahin, Ruta and Shango — held through Akata Energy Limited itself and through AMW Petroleum Limited, Ruta Exploration and Production Company Limited and Shugaba Resources Limited."}]},
      {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "A clustered development on OML 95"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "All four fields sit on OML 95 and were drilled and previously operated by the Chevron joint venture before being classified as marginal fields. Because they lie close together, they can be developed as a cluster rather than one at a time, sharing facilities between them. That shared infrastructure also creates the opportunity for other marginal-field operators to produce through the same facilities."}]},
      {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "The fields"}]},
      {"type": "bulletList", "content": [
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Meta — discovered by Chevron Nigeria Limited in 1965, in 9 to 10 metres of water offshore the western Niger Delta. Three wells, drilled in 1965, 1976 and 1992, encountered ten hydrocarbon-bearing sands; all three were tested and then suspended."}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Mahin — discovered by Chevron Nigeria Limited in 1986, in 13 to 15 metres of water. Two wells have been drilled, the second of which encountered a series of hydrocarbon-bearing sands and was subsequently suspended."}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Ruta — discovered in 1979, in water depths of roughly 100 to 118 feet, about 10 kilometres north of the Opolo field and 8 kilometres west of the Malu field. Five wells have been drilled; an appraisal well in 1995 tested a third fault block and found net oil in the D-0 sand."}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Shango — in the north-western part of OML 95, in about 85 feet of water, where the geology straddles the Benin and Niger Delta basins. The discovery well was drilled in 1991 and encountered fourteen hydrocarbon-bearing sands; a drill-stem test confirmed oil flowing from the K sand."}]}]}
      ]},
      {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Route to production"}]},
      {"type": "orderedList", "content": [
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Raise development funding and partnership, and complete the minimum work programme."}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Identify the wells to be re-entered and completed, and bring them into production."}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Develop a Field Development Plan and obtain approval for it."}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Execute the plan and install the production facilities."}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Evacuate production through the existing Chevron facility on OML 95."}]}]}
      ]}
    ]
  }$v$::jsonb,
  updated_at = now()
where slug = $v$akata-energy$v$;
