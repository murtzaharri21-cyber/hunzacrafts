Deploying Hunza & Co. to Vercel (with Supabase)

This document describes the exact, minimal steps to deploy the repository to Vercel and configure Supabase so the storefront and admin UI work correctly.

1) Connect repo to Vercel
- In Vercel: Import Project → Connect Git Repository → choose murtzaharri21-cyber/hunzacrafts
- Branch to deploy: agents/full-website-run-main-to-admin (or main for production)
- Build Command: npm run build
- Output Directory: leave default (Vite/Nitro will write to .vercel/output)

2) Environment variables (set for "Preview" and "Production")
Set these four env vars in the Vercel Project Settings → Environment Variables.
- VITE_SUPABASE_URL = https://<your-project-ref>.supabase.co
- VITE_SUPABASE_PUBLISHABLE_KEY = <your anon / publishable key>
- SUPABASE_URL = https://<your-project-ref>.supabase.co
- SUPABASE_PUBLISHABLE_KEY = <your anon / publishable key>
- (Optional) VITE_ADMIN_EMAILS = comma-separated list of admin emails to allow login fallback (e.g. admin@example.com,user2@example.com)

Notes:
- Do NOT set the Supabase service_role (secret) as a client environment variable.
- If you have multiple Supabase projects for preview vs prod, set different env values per environment.

3) Supabase redirect URLs (Auth settings)
In the Supabase dashboard for your project:
- Settings → Authentication → Redirect URLs
- Add the Vercel domain(s) used by your deployment. Example entries to add:
  - https://<your-vercel-domain>
  - https://<your-vercel-domain>/
  - https://<your-vercel-domain>/auth
  - https://<your-vercel-domain>/auth/callback
  - https://<your-vercel-domain>/admin
- Also add the preview deployment domain pattern(s) if you want previews to be able to sign-in (Vercel provides a unique preview URL per PR).

If you aren't sure exactly which path Supabase will redirect to, adding the root production and preview domain is usually sufficient (Supabase will redirect back to the origin). Ensure the exact domain (including protocol) is listed.

4) Where to get the values in Supabase
- Project URL and anon key: Supabase → Project → Settings → API
  - Project URL: e.g. https://fjzmbemfhtmydrycvrds.supabase.co
  - anon/public key: listed on the API page (labelled "anon" or "anon key")

5) Making a user an admin (once they sign up)
The app gates admin UI on a user role entry (public.user_roles). Use the SQL editor in Supabase or the table editor to add a row with role 'admin'. Example SQL (run in Supabase SQL editor):

INSERT INTO public.user_roles (user_id, role)
VALUES ('<supabase-user-uuid>', 'admin');

To find a user's UUID: after a user signs up or logs in, look in Supabase Auth > Users or inspect the user's session in the app console.

6) Trigger a redeploy
- After setting env vars in Vercel, trigger a redeploy: either push a new commit to the branch or use the Vercel dashboard to re-deploy the latest commit.

7) Verifying runtime
- Visit your Vercel domain; the storefront should load.
- Visit /auth to sign-in (email/password or OAuth depending on your Supabase setup).
- Visit /admin — the admin UI requires:
  - The user is signed in (active session) and
  - A corresponding row in public.user_roles with role = 'admin'

8) Troubleshooting
- If login redirects fail: check that the exact Vercel domain is listed in Supabase redirect URLs.
- If the site builds fail on Vercel: check Build Logs in Vercel (paste them here if you want help). Common fixes:
  - Ensure Node version compatibility (Vercel uses a default Node; set in Project Settings if needed).
  - Make sure env vars are set for both Preview and Production.

9) Optional: programmatic deploys
- If you want me to perform the deployment programmatically (set env vars or trigger deployments), I need one of these:
  - A Vercel Personal Token with project scope (not recommended to paste in chat unless you understand the risk), or
  - You invite a GitHub App or give me collaborator access to the Vercel project. Otherwise I cannot modify your Vercel project directly.

10) Final notes
- The branch agents/full-website-run-main-to-admin has been pushed to your GitHub repository with local dev fixes (demo admin support, TS fixes). Point Vercel to this branch if you want a deploy that includes the fixes.
- If you paste your Vercel deployment URL here, I will give the exact redirect URLs to add to Supabase and can verify the deployment and /admin behavior.

If you want me to continue (I can either):
- Provide the precise redirect entries for the Vercel URL you paste, verify build logs, and help fix any runtime errors; or
- Provide shell commands and Vercel CLI commands you can run locally to set environment variables and redeploy.

---
If you'd like, I can also add this file to the repo and push it (already done). Redeploying requires the Vercel dashboard or a token.
