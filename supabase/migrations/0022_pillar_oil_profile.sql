-- =====================================================================
-- VECTIS: a fuller profile for Pillar Oil Limited.
--
-- Source: the company's own website (pillaroil.com.ng), read November
-- 2026 — the company overview, the three asset pages (PML 17, OPL 233,
-- PPL 201), midstream, downstream, HSE and community pages.
--
-- Everything here is already published by Pillar Oil itself, which is
-- why figures appear in this profile but not in Akata Energy's: Akata's
-- came from a private document.
--
-- Figures and claims are attributed to the company, not asserted by
-- VECTIS. Nothing here says or implies that VECTIS owns or controls
-- Pillar Oil.
--
-- This replaces the shorter profile written in 0021. Safe to run again.
-- =====================================================================

update public.investments set
  summary = $v$An independent, wholly Nigerian oil and gas company, incorporated in 1997, working across three upstream licences, a phased gas development programme and a stake in a modular refinery.$v$,
  description = $v${
    "type": "doc",
    "content": [
      {"type": "paragraph", "content": [{"type": "text", "text": "Pillar Oil Limited is an independent and wholly Nigerian energy exploration and development company. It was incorporated on 10 July 1997 and works from a head office in Lekki, Lagos, with operations in Lagos and Delta States."}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "The company explores for and commercially develops crude oil and natural gas. Its position runs from the wellhead through to refined products: it produces oil and gas from its own acreage, is building the gas processing to go with it, and holds a stake in a refinery that takes its crude as feedstock."}]},

      {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Upstream"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Pillar Oil holds interests in three licensed areas."}]},

      {"type": "heading", "attrs": {"level": 3}, "content": [{"type": "text", "text": "PML 17 — Umuseti-Igbuku field"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "The company's producing asset, awarded to Pillar Oil in 2003 and previously operated by Elf. Pillar Oil is the operator and holds a 60 per cent working interest."}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Five wells came with the licence — Umuseti-1, Umuseti-2, Umuseti-3T, Igbuku-1 and Ase River-1 — and the company has since drilled Umuseti-4, -5, -6 and -7 and Anagba-1. It inherited limited two- and three-dimensional seismic data and has since acquired 3D seismic across the whole field."}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Facilities on the licence comprise a flow station rated at 7,000 barrels a day, 44,000 barrels of process and storage tankage, and a seven-kilometre six-inch pipeline carrying production to the Group Gathering Facility for evacuation."}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Pillar Oil reports production of 4,100 barrels of oil and 2.6 million standard cubic feet of gas a day. It reports cumulative production of 11.0 million stock tank barrels of oil as at 30 June 2024, and 5.5 billion standard cubic feet of gas since production began in 2009."}]},

      {"type": "heading", "attrs": {"level": 3}, "content": [{"type": "text", "text": "OPL 233 — Olobia, Bayelsa State"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "A shallow offshore block of roughly 127 square kilometres in Bayelsa State, around Koluama and Fish Town. Nigdel United Oil Company operates it on behalf of NUIMS under a production sharing contract, with Portico Energy, a Pillar Oil subsidiary, providing technical and financial support for exploration and development. The working interest under the contract is 40 per cent."}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "The block holds one legacy well, Olobia-1, drilled by SPDC in 1986. Olobia-2 and a sidetrack were drilled in 2022, and the sidetrack has been completed for production. 3D seismic was acquired, processed and interpreted in 2022, which the company says points to prospective volumes beyond those already discovered. Short- to mid-term targets are 1,000 barrels of oil and 25 million standard cubic feet of gas a day."}]},

      {"type": "heading", "attrs": {"level": 3}, "content": [{"type": "text", "text": "PPL 201 — Emohua field"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "An onshore block in the south-eastern part of OML 22 in the Niger Delta, outside the near-shore swamp, about 16.5 kilometres south-east of the Rumuekpe manifold that feeds the Bonny terminal, and some 20 kilometres north-west of Port Harcourt. Pillar Oil holds a 12 per cent working interest under a production sharing contract."}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "The field was discovered in 1979 by the Emohua 01 well, which encountered around nine hydrocarbon-bearing levels. Emohua 1 has been drilled to 11,050 feet, with a development well, Emohua 2, planned to follow. In the short term production is to be routed in bulk to the Ogbele field for processing; in the mid term the plan is a crude processing and evacuation facility rated at 10,000 barrels a day together with a gas processing plant. The short-term target is 5,000 barrels of oil and 25 million standard cubic feet of gas a day."}]},

      {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Midstream: a phased gas development"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Pillar Oil's midstream plan is a gas development programme built out from PML 17 in three phases."}]},
      {"type": "orderedList", "content": [
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "On the Umuseti structure, develop and monetise all of the associated and non-associated gas produced, using third-party gas infrastructure. Associated gas utilisation on the licence is around 60 per cent."}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "On the Igbuku structure in the southern acreage, develop non-associated gas resources the company puts at more than 288 billion standard cubic feet, together with condensate, anchored on a modular gas processing plant that Pillar Oil would build, own and operate."}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Target the remaining gas across the acreage, which the company puts at more than 1.1 trillion cubic feet of developable volume in total, by extending and upgrading the facilities built in the earlier phases."}]}]}
      ]},
      {"type": "paragraph", "content": [{"type": "text", "text": "The facilities planned for the second phase are a 60 million standard cubic feet a day cryogenic processing plant with fractionation units at Umuseti, a four-kilometre twelve-inch pipeline tying in to the OB3 pipeline, LPG and propane storage with truck loading, and condensate stabilisation and storage with a delivery line to the Umuseti production facility. The products are lean gas, LPG, propane and condensate."}]},

      {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Downstream"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Pillar Oil holds a 7 per cent equity stake in OPAC Refineries Limited, a modular refinery at Umuseti, Kwale, in Delta State, commissioned in 2017. The refinery processes 10,000 barrels of crude a day, with plans to scale to 60,000, and completed its first production run in 2024."}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Its products are automotive gas oil, dual purpose kerosene, naphtha and low sulphur fuel oil, with a reformer unit planned that would add premium motor spirit. The refinery is built to international standards and operates under the NMDPRA, API and ASME frameworks."}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Pillar Oil supplies light sweet crude from PML 17 as the refinery's main feedstock, which makes the two ends of the business a single chain and, in the company's words, reduces the country's reliance on imported fuels. The downstream business also sells the LPG and propane that the gas programme is designed to produce."}]},

      {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Safety and the environment"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "The company works to a stated goal of no harm to people or the environment. It says it is pursuing certification to ISO 45001 for occupational health and safety and ISO 14001 for environmental management, and that it has recorded no lost-time incidents for over ten years."}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Its systems include an emergency response plan covering fire, oil spills and medical emergencies, an oil spill response plan following NUPRC guidelines, a greenhouse gas management strategy with emissions monitoring and regulatory reporting, and an annual HSE improvement plan. Environmental impact assessments follow NUPRC and Federal Ministry of Environment standards, and the company references the Petroleum Industry Act 2021."}]},

      {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Host communities"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Pillar Oil states that it manages relations with its host communities through dialogue and engagement, and that it assesses the environmental, social and economic effects of what it does. Its reported community work in Umuseti, Igbuku, Umusam, Isumpe and Umusadege covers:"}]},
      {"type": "bulletList", "content": [
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Education — a school building at Umuseti-Ogbe Primary School, administrative blocks at Owessei and Iyiatu Primary Schools, furnishing for four primary schools, computers for Igbuku Secondary School, and assistance for secondary and tertiary students from the host communities."}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Shelter and public buildings — a housing scheme for Isumpe, a town hall and mini market for Umuseti, and a palace and mini market for Umusam."}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Power and water — transformers installed for three communities, solar lighting at the Umuseti town hall, solar street lights, and a water project at Umusadege-Ogbe."}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Transport — a bus for each of four communities."}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Skills — an annual programme training young men and women from the host communities in trades including welding, fashion design, catering, computer repair, electrical installation and plumbing, with starter packs on completion."}]}]}
      ]},

      {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Standards"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Pillar Oil's stated vision is to become the leading independent energy company in Nigeria, run sustainably and responsibly, and its stated values are professionalism, integrity, loyalty, leadership, accountability and respect. It operates under the Nigerian industry regulators: the NUPRC, the NMDPRA and the NCDMB."}]}
    ]
  }$v$::jsonb,
  updated_at = now()
where slug = $v$pillar-oil$v$;
