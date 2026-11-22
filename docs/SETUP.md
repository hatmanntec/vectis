# VECTIS — Setup guide

Plain-language steps for the parts that must be done in your own accounts.
Each part says which milestone needs it. Code is delivered as a downloadable zip and
added to GitHub from the Mac Terminal.

Accounts in use (decided 22 Nov 2026):

| Service | Account |
| --- | --- |
| GitHub | hatmanntec@gmail.com |
| Vercel | hatmanntec@gmail.com |
| Supabase | vectisgp@gmail.com |

---

## Part 1: GitHub repository (needed now, M1)

1. Sign in to GitHub as **hatmanntec**.
2. Click **+** (top right) → **New repository**.
3. Repository name: `vectis`. Visibility: **Private**.
4. Leave "Add a README", ".gitignore" and "license" **unticked**, so the repository is completely empty.
5. Click **Create repository**.

Then unzip the delivered project and push it from Terminal:

```bash
cd ~/Downloads/vectis          # the unzipped folder
git init -b main
git add .
git commit -m "M1: project skeleton"
git remote add origin https://github.com/hatmanntec/vectis.git
git push -u origin main
```

For each later milestone: unzip the new delivery over the same folder, then run
`git add .`, `git commit -m "<milestone name>"` and `git push`.

## Part 2: Vercel project (needed now, M1)

1. Sign in to Vercel with hatmanntec@gmail.com.
2. **Add New… → Project**, then choose **Import** next to `hatmanntec/vectis`.
   - If it isn't listed, click **Adjust GitHub App Permissions** and give Vercel access to the `vectis` repository.
3. Framework preset: **Next.js** (detected automatically). Leave every other setting as it is.
4. Click **Deploy**. After about a minute you get a link ending in `.vercel.app`.

**Check:** open the link. You should see the VECTIS logo on a white panel and "Our new website is being prepared".
From now on, every push to GitHub redeploys automatically.

## Part 3: Supabase project (needed at M2, not yet)

1. Sign in to supabase.com with **vectisgp@gmail.com**.
2. **New project**.
   - Name: `vectis`
   - Database password: click **Generate**, then save it in your password manager. It isn't needed day to day, but it's needed for backups and recovery.
   - Region: **West EU (London)**, normally the lowest delay from Nigeria.
3. Wait for the project to finish setting up (2–3 minutes).

Don't send any keys or passwords to Claude in chat. When M2 is ready, this guide will list exactly
which two values to copy into Vercel, and which SQL files to run.

---

Parts 4 onwards (database migrations, first administrator, two-step login) are added at M2 and M3.
