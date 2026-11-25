-- =====================================================================
-- VECTIS: the full Akata Energy Limited profile.
--
-- Source: the company's own Company & Asset Profile, dated December
-- 2023, supplied by the client, who has confirmed the figures may be
-- published.
--
-- This replaces the shorter profile written in 0021, and adds the
-- equity interests, the reserve and volume estimates, the production
-- ambitions and the Equatorial Guinea block that were held back there.
--
-- Three things in the source document do not agree with themselves, and
-- are handled as follows:
--   * Meta field: the document labels 5.3 mmbo as P50 and 10.3 mmbo as
--     P90, which is the wrong way round. Both figures are given below,
--     credited to Gaffney Cline Associates, without the P50/P90 labels,
--     until the client confirms which is which.
--   * Mahin field: the document gives 1986 as the discovery year but
--     1968 as the year Mahin-1 was drilled. Both are stated below.
--   * Mahin field: the document says "ten (9)" sands and then lists
--     nine. Nine is used.
-- One unit has been corrected: API gravity is given below in degrees,
-- not as a percentage.
--
-- Nothing here says or implies that VECTIS owns or controls Akata
-- Energy. Safe to run again.
-- =====================================================================

update public.investments set
  summary = $v$An indigenous petroleum development company holding equity interests in four proven shallow-water fields on OML 95, offshore the western Niger Delta, and bidding for an appraisal block in Equatorial Guinea.$v$,
  description = $v${
    "type": "doc",
    "content": [
      {"type": "paragraph", "content": [{"type": "text", "text": "Akata Energy Limited is an indigenous petroleum development company holding equity interests in proven fields in the shallow-water Niger Delta. It works from Maitama, Abuja, and brings together a team with decades of technical, operational and commercial experience in exploration and production."}]},

      {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "The interests"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Four fields, held directly and through partner entities:"}]},
      {"type": "bulletList", "content": [
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Meta field — a 68.45 per cent interest, held through AMW Petroleum Limited."}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Mahin field — held in full by Akata Energy Limited."}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Ruta field — a 15.92 per cent interest, held through Ruta Exploration and Production Company Limited."}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Shango field — held in full through Shugaba Resources Limited."}]}]}
      ]},

      {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "A clustered development on OML 95"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "All four fields sit on OML 95 and were drilled and previously operated by the Chevron joint venture before being classified as marginal fields. Because they lie close together they can be developed as a cluster rather than one at a time, sharing facilities between them, and that shared infrastructure creates the opportunity for other marginal-field operators to produce through the same plant."}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "On that basis the company envisages aggregate production of 40,000 to 50,000 barrels of crude oil a day across the cluster. Production is to be evacuated through the existing Chevron facility on OML 95."}]},

      {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "The fields"}]},

      {"type": "heading", "attrs": {"level": 3}, "content": [{"type": "text", "text": "Meta"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Discovered by Chevron Nigeria Limited in 1965, in 9 to 10 metres of water offshore the western Niger Delta. Meta-1A was drilled that year to a total depth of 11,900 feet; Meta-2 and Meta-3 followed in 1976 and 1992 to test the other fault compartments."}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Between them the three wells encountered ten hydrocarbon-bearing sands — C5, C6, D1, D6, D8, E6, H3, H4, J18 and J22. All three were tested, with varying results, and then suspended. The total flow rate established on the field was 4,522 barrels of oil per day and 5.228 million standard cubic feet of gas per day."}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "A competent person's report on the field has been completed by Gaffney Cline Associates and is available for review. It gives reserve estimates for the field of 5.3 and 10.3 million barrels of oil."}]},

      {"type": "heading", "attrs": {"level": 3}, "content": [{"type": "text", "text": "Mahin"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Recorded as discovered by Chevron Nigeria Limited in 1986, in 13 to 15 metres of water offshore the western Niger Delta. Mahin-1 was drilled to a total depth of 9,540.6 feet in 1968, and Mahin-2 was drilled in 1986 to test the other fault compartments."}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Mahin-2 encountered nine hydrocarbon-bearing sands. Repeat formation tests were carried out at various depths, with varying results, and the well was then suspended; no drill-stem tests were conducted on it."}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Dharmathan Resources Limited has been engaged to carry out a preliminary evaluation of the asset. The current indication is a proven reserves estimate of 23 million barrels of oil, with significant upside potential."}]},

      {"type": "heading", "attrs": {"level": 3}, "content": [{"type": "text", "text": "Ruta"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Offshore the western Niger Delta in water depths of roughly 100 to 118 feet, about 10 kilometres north of the Opolo field and 8 kilometres west of the Malu field. The field was discovered in 1979 by Ruta 2, which encountered 24 feet of net oil across three sands between 4,700 and 8,000 feet measured depth."}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Ruta 1 found no pay zone, having been cut by a major fault. The Ruta 3 appraisal well, drilled in 1995, tested the third fault block and found 53 feet of net oil in a single sand, the D-0, at 4,545 feet true vertical depth subsea. Five wells have been drilled in the field in total. A risk base case volumetric estimate for the D-0 reservoir is predicated on cumulative oil production of 28.39 million stock tank barrels."}]},

      {"type": "heading", "attrs": {"level": 3}, "content": [{"type": "text", "text": "Shango"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "In the north-western part of OML 95, operated by Chevron Nigeria Limited, in about 85 feet of water. The geology of the field straddles the Benin and Niger Delta basins."}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "The discovery well, Shango-01, was drilled in 1991 to a total depth of 10,642 feet below the kelly bushing and encountered fourteen hydrocarbon-bearing sands. It remains the only well drilled on the field to date. Drill-stem tests were carried out over two intervals: the K sand, between 8,530 and 8,740 feet, flowed oil to surface at 1,325 barrels a day, while the shallower interval between 7,990 and 8,110 feet did not flow."}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "An independent evaluation puts stock tank oil initially in place at 89.61 million barrels and gas initially in place at 26.02 billion cubic feet, with reserves of 17.92 million barrels of oil at 37.5 degrees API and 22.12 billion cubic feet of gas."}]},

      {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Equatorial Guinea: Block EG 23"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Beyond OML 95, Akata Energy is bidding for Block EG 23 in Equatorial Guinea, a shallow-water block open for appraisal and development, for full ownership. The company intends to produce up to 20,000 barrels of crude oil a day from the block, produced through the ALBA field production platform."}]},

      {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Route to production"}]},
      {"type": "orderedList", "content": [
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Raise development funding and partnership, and complete the minimum work programme."}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Identify the wells to be re-entered and completed, and bring them into production."}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Develop a Field Development Plan and obtain approval for it."}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Execute the plan and install the production facilities."}]}]},
        {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Evacuate production through the existing Chevron facility on OML 95, and in Equatorial Guinea through the ALBA field platform."}]}]}
      ]},

      {"type": "paragraph", "content": [{"type": "text", "text": "Interests, reserve estimates and production figures above are as set out in Akata Energy's company and asset profile of December 2023."}]}
    ]
  }$v$::jsonb,
  updated_at = now()
where slug = $v$akata-energy$v$;
