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

## Part 5: Login settings and the first administrator (M3, once)

All in the Supabase dashboard for the VECTIS project (signed in as vectisgp@gmail.com).
Menu names can differ slightly between dashboard versions; look for the same words.

**5.1 Close public sign-up.** Go to Authentication → Sign In / Providers. Under **Email**, keep the
provider **enabled**, but switch **off** "Allow new users to sign up" (it may also appear
under General user settings). Save. Nobody can then create an account through the API;
administrators are added only by you, below.

**5.2 Tell Supabase where the website is.** Go to Authentication → URL Configuration:
- **Site URL:** your site address, e.g. `https://vectis-xyz.vercel.app`
- **Redirect URLs:** add `https://vectis-xyz.vercel.app/admin/auth/confirm`
  (with your real address). Password-reset emails only work for addresses listed here.

**5.3 Check two-step verification is available.** Go to Authentication → Multi-Factor (or "MFA").
Make sure **TOTP / Authenticator app** is enabled. It is on by default.

**5.4 Create the administrator's login.** Go to Authentication → Users → **Add user → Create new user**.
- Email: the administrator's address
- Password: at least 12 characters (save it in your password manager)
- Tick **Auto Confirm User**
- Click **Create user**

**5.5 Make that login an administrator.** Go to SQL Editor → New query, paste the two lines below,
replace the email and name with your own, and click **Run**:

```sql
insert into public.admin_profiles (id, full_name)
select id, 'Your Full Name' from auth.users where email = 'admin@example.com';
```

It should say **"Success. 1 row affected"**. "0 rows" means the email didn't match the user
created in 5.4, so check the spelling.

**5.6 First sign-in.**
1. Install **Google Authenticator** or **Microsoft Authenticator** on your phone.
2. Open `https://<your-site>.vercel.app/admin`. You'll be taken to the login page.
3. Enter the email and password. The site then shows **Set up two-step verification**.
4. Press **Show my QR code**, scan it with the app, and type the 6-digit code it shows.
5. You arrive at the CMS dashboard ("Welcome, …"). From now on, every sign-in asks for
   your password **and** a fresh code from the app.

**About password-reset emails.** Supabase's built-in email service is meant for testing. It sends only a
few emails per hour, and only to members of the Supabase organisation. Using vectisgp@gmail.com
as the administrator email works. For other addresses, a custom email service is added later (once the
VECTIS domain exists).

### If the administrator loses their phone

Anyone with access to the Supabase dashboard can reset two-step verification. In SQL Editor run
(with the right email):

```sql
delete from auth.mfa_factors
where user_id = (select id from auth.users where email = 'admin@example.com');
```

The next sign-in will ask to set up the authenticator app again. Keep the Supabase account
itself protected: turn on two-step verification for vectisgp@gmail.com in Supabase's
Account settings, and for the Gmail account too.
