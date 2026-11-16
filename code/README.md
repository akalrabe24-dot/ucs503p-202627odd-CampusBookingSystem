# Campus Reserve

The portal uses Supabase Postgres for the database, Supabase Auth for email/password sign-in, and the Supabase Data API for application requests. The React frontend can run locally or on GitHub Pages.

## Set up a Supabase project

1. Use the campus booking project in the [Supabase dashboard](https://supabase.com/dashboard/projects). For a new, empty project, apply the migration from the repository root:

   ```sh
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase migration list
   supabase db push --dry-run
   supabase db push
   ```

   If the project already has campus tables or data, inspect its schema and migration history before pushing and reconcile the migration with the existing tables. The migration follows the repository's [ER diagram](../docs/Diagrams_CampusBookingSystem/ER-Diagram.jpeg), with Supabase Auth storing credentials and a profiles table storing campus roles and society assignments.

2. Import the campus locations, resources and societies before provisioning students. For a prototype, review and run [seed.sql](../supabase/seed.sql) in the dashboard SQL Editor. It contains the checked-in sample catalog and omits demo bookings and accounts. For the live campus project, load the approved campus catalog.
3. In Authentication settings, enable Email and disable public signups. Set the Site URL to the deployed portal URL. Create each account through Authentication → Users, then add its profile through the SQL Editor using that account's UUID. Use an existing society ID for students and leave the society column empty for staff.

   ```sql
   insert into public.profiles (id, name, email, role, "societyId")
   select id, 'Student name', email, 'student', 'soc-ieee'
   from auth.users
   where email = 'student@example.edu';
   ```

   Staff roles are `incharge` and `admin`. A profile is required for portal access.

4. Copy [the environment example](.env.example) to `code/.env.local`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the project Connect dialog. Use the publishable key or legacy `anon` key. Keep database passwords, access tokens, and secret or service-role keys out of browser configuration and Git.

See the Supabase guides for [database migrations](https://supabase.com/docs/guides/local-development/database-migrations), [React sign-in](https://supabase.com/docs/guides/auth/quickstarts/react), and [API keys](https://supabase.com/docs/guides/getting-started/api-keys).

## Run and verify

Use Node.js 22.12 or newer. From `code/`:

```sh
npm ci
npm run dev
npm run build
npm run test:smoke
npm run test:db
```

Open the URL printed by Vite, including the repository path. Use `npm.cmd` on Windows if PowerShell blocks `npm.ps1`. For local Supabase with Docker, run `supabase start` and `supabase db reset` from the repository root, then use the local API URL and publishable key in `code/.env.local`. The database test runs the migration and seed in embedded Postgres with test Auth identities and exercises RLS, booking conflicts, status transitions, maintenance and inbox isolation.

To check the hosted setup, sign in as a student and submit a request, inspect the same room and date from a second student account, approve the request as in-charge, and confirm the original student's inbox receives the decision. A pending or approved request blocks overlaps across accounts. The availability page uses campus time (IST) and only shows booking details to users allowed to see that request. Maintenance windows can be entered in `maintenance_unavailability` with explicit time-zone offsets. An overlapping active booking must be resolved before adding such a window.

For GitHub Pages, set repository Actions variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` before running the deployment workflow. The workflow builds from source. If hosting the built folder elsewhere, configure the host to fall back to `index.html` for application routes.

For an isolated browser demo, leave both connection variables unset and set `VITE_CAMPUS_DEMO=true`. Demo bookings and accounts use browser-local data and are separate from hosted data.

## Image source

The sign-in screen credits the Thapar Learning Laboratory photograph to [McCullough Mulvin Architects](https://mcculloughmulvin.com/projects/thapar-university-learning-centre).
