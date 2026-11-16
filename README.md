# Relief Management System

A web application for running a relief program for **widows, the elderly and people with disabilities**: public applications, staff review and approval, relief cards, monthly requests, item distribution and reporting.

> **v2** is a full rewrite of the original PHP/MySQL university project (see git history for v1). It adds authentication, role-based access, database-enforced business rules, a responsive UI and a deployable Node stack.

## Features

**Public** (no login)
- Apply for relief with NID, phone and photo, with validation and clear errors that keep what you typed
- Check application status (verified with NID **and** phone — no NID enumeration)
- Submit one monthly request, with a live countdown to the next eligible date

**Staff / Admin** (login required)
- Dashboard with live counts and recent applications
- Recipients: search, filter by status/category, pagination, edit, photo replacement
- Approvals queue — approving issues a numbered relief card automatically
- Printable relief cards (print stylesheet included)
- Distributions: one record per item per recipient per month
- Statistics: 12-month request chart and per-category breakdown
- Audit log of every sensitive action; admin-only deletes
- Account page: change your own password (current password required)
- Staff page (admin): create staff/admin accounts with a temporary password, deactivate (signs the user out immediately) or reactivate, reset forgotten passwords

## Business rules (enforced in the database, not just the UI)

| Rule | How |
| --- | --- |
| One request per recipient per month | `UNIQUE (recipientId, period)` |
| Same item once per recipient per month (case/spacing-insensitive) | `UNIQUE (recipientId, itemKey, period)` |
| Only approved recipients can request or receive items | checked in server actions |
| Elderly recipients must be 60+ | zod schema |
| Months follow Bangladesh time (Asia/Dhaka) | `src/lib/period.ts` (unit-tested) |

## Stack

Next.js 15 (App Router, Server Actions) · TypeScript · Tailwind CSS 4 · Prisma 6 · SQLite locally / [Turso](https://turso.tech) (libSQL) in production · zod · jose + bcrypt for sessions

## Getting started (local)

```bash
cp .env.example .env          # defaults work: a local SQLite file
npm install
npx prisma migrate dev        # creates prisma/dev.db and seeds the first admin
npm run dev                   # http://localhost:3000
```

Sign in at `/login` with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from your `.env`, and **change that password before going live**.

## Deploying (Vercel + Turso)

1. Create a Turso database (`turso db create relief`) and a database token (`turso db tokens create relief`).
2. In Vercel set `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `SESSION_SECRET` (`openssl rand -base64 32`), `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.
3. Deploy. The `vercel-build` script generates the Prisma client, applies migrations to Turso (`scripts/migrate-turso.mjs`, idempotent), seeds the admin if missing, then builds.

Turso is accessed over HTTPS through Prisma's libSQL adapter, so no native modules or writable disk are needed. Photos are stored in the database (≤ 500 KB each).

## Scripts

`dev` · `build` · `start` · `lint` · `typecheck` · `test` · `db:migrate` · `db:seed`

## Security notes

- All queries go through Prisma (parameterised); inputs are validated with zod on the server
- Sessions are signed, HTTP-only, SameSite=Lax cookies; users are re-checked against the DB on each request
- Server Actions provide built-in CSRF protection (origin checking)
- Uploads are checked by size, declared type **and** magic bytes; photos are only served to signed-in staff
- Security headers set in `next.config.ts`

Staff can change their own password under **Account**. 
## Rate limiting

Counters live in the database (serverless instances share no memory), as atomic fixed-window upserts: login 10/15 min per IP and 8/15 min per email; applications 5/hour per IP; status checks and monthly requests 10/15 min per IP and per NID; password change 5/15 min per user. Limits fail open if the database errors. Tune them where `rateLimit(...)` is called in `src/app/actions/`.

Known limitation: no email-based *forgotten*-password flow — an admin resets a staff member's password under **Staff** (they must choose a new one at next sign-in).

---

## বাংলায় সংক্ষেপে

এটি বিধবা, বয়োজ্যেষ্ঠ ও প্রতিবন্ধী ব্যক্তিদের জন্য রিলিফ কর্মসূচি পরিচালনার একটি ওয়েব অ্যাপ। আবেদন, অনুমোদন, রিলিফ কার্ড, মাসিক আবেদন, বিতরণ ও পরিসংখ্যান — সব এক জায়গায়। চালু করতে উপরের **Getting started** অংশ অনুসরণ করুন।

## License

MIT
