# VECTIS: Setup guide

Plain-language steps for the parts done in your own accounts. Code arrives as a
zip; you unzip it over `~/Projects/vectis` and push it from Terminal.

| Service | Account |
| --- | --- |
| GitHub | hatmanntec (repository `hatmanntec/vectis`) |
| Vercel | hatmanntec |
| Supabase | vectisgp@gmail.com |

**Never paste passwords or keys into the Claude chat.** The only Supabase values the
website uses are the Project URL and the Publishable key, and they go into Vercel only.

---

## Part 1: Updating the code (every milestone)

```bash
cd ~/Projects
unzip -o ~/Downloads/vectis-mX.zip      # replace mX with the milestone, e.g. m2
cd ~/Projects/vectis
git add .
git commit -m "MX: <milestone name>"
git push
```

Vercel rebuilds the site automatically after every push.

---

## Part 2: Supabase project (once)

1. Sign in at supabase.com with **vectisgp@gmail.com**.
2. **New project**: name `vectis`, click **Generate** for the database password and
   save it in a password manager, region **West EU (London)**. Leave the other options as they are.
3. Wait 2–3 minutes until the project is ready.

---

## Part 3: Create the database (M2, once)

Run these in Terminal, one at a time, from `~/Projects/vectis`.
The tool version is fixed at 3.2.0 so the commands behave exactly as tested.

1. **Sign the Supabase tool in to your account**
   ```bash
   npx supabase@3.2.0 login
   ```
   A browser window opens. Make sure it is signed in to supabase.com as
   **vectisgp@gmail.com** (sign out of any other Supabase account first), then approve.

2. **Connect this folder to the VECTIS project.** Find the *project ref*: it is the 20-letter
   code in the address bar when the project is open (`supabase.com/dashboard/project/<ref>`),
   also shown under Project Settings → General → Project ID.
   ```bash
   npx supabase@3.2.0 link YOUR_PROJECT_REF
   ```
   If asked for the database password, paste the one you saved (nothing appears while you type, which is normal).

3. **Preview, then create the database**
   ```bash
   npx supabase@3.2.0 db push --remote --dry-run
   npx supabase@3.2.0 db push --remote
   ```
   The first line only lists the 15 files it *would* apply. The second applies them.
   It should finish with "Finished supabase db push".

4. **Check in the dashboard**
   - Table Editor: 19 tables (admin_profiles, audit_logs, companies, …). Every table shows
     a lock icon / "RLS enabled".
   - `pages` has 8 rows (Home, About VECTIS, …), all `draft`.
   - `website_settings` has 1 row (site_name VECTIS).
   - Every other table is empty. That's correct, since there's no sample content.
   - Storage: two buckets, `public-media` (Public) and `private-files` (Private).

If any step shows an error, copy the whole message into the chat.

---

## Part 4: Connect the website to the database (M2, once)

1. In Supabase, open **Project Settings → Data API** and copy the **Project URL**
   (`https://<ref>.supabase.co`).
2. Open **Project Settings → API Keys** and copy the **Publishable key** (starts with
   `sb_publishable_`). Older projects call this the "anon public" key, which is fine too.
   Do **not** copy the secret / service_role key.
3. In Vercel: open the `vectis` project → **Settings → Environment Variables**. Add three
   variables, each ticked for **Production, Preview and Development**:

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | the Project URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | the Publishable key |
   | `NEXT_PUBLIC_SITE_URL` | your site's `.vercel.app` address, e.g. `https://vectis-xyz.vercel.app` (no slash at the end) |

4. Push the M2 code (Part 1). The settings must be in Vercel **before** this deploy, because
   they are built into the site. If you added them after, use Vercel → **Deployments** →
   the latest one → **⋯ → Redeploy**.
5. **Check:** open `https://<your-site>.vercel.app/api/health`. It should show
   `{"database":"ok"}`.
   - `"not configured"` means the Vercel settings are missing; check the names, then redeploy.
   - `"error"` means the site can't reach the database; check the URL and key.

---

## Part 5: First administrator (M3)

Added with milestone M3 (login and two-step verification).
