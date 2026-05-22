# Test Report — Student Complaint Portal (MVP)

Generated: 2026-05-21

Purpose: manual and code review testing for the MVP web app. This document lists discovered bugs (numbered as in-source `FIX BUG-XX` notes), root causes, applied fixes (or recommended fixes), and verification steps.

## Summary
- Total reviewed files: models, services, utils, HTML pages, app bootstrap
- Bugs identified and fixed in codebase: BUG-01 .. BUG-14 (see details below)
- Manual test checklist included at the end with pass/notes

---

## Bug List (detailed)

1) BUG-01 — Complaint model restoration
   - Location: `src/models/Complaint.js`
   - Symptom: `fromJSON` could not correctly restore private (`#`) fields when recreating instances from storage.
   - Root cause: static `fromJSON` could not assign private fields directly on an instance.
   - Fix applied: `Complaint` constructor accepts an internal `_restore` object; `fromJSON` passes saved values through it so private fields are initialized in the constructor.
   - Verification: complaints loaded from storage show correct `status`, `createdAt`, `updatedAt`, and `adminNotes` values.

2) BUG-02 — Preserve `createdAt` on Users/Students
   - Location: `src/models/User.js`, `src/models/Student.js`
   - Symptom: restored users lost original `createdAt` timestamp.
   - Root cause: constructors didn't accept `createdAt` when restoring from JSON.
   - Fix applied: constructors accept optional `createdAt` argument; `fromJSON` passes it through.
   - Verification: registered student `Registered` date appears correctly in admin/student views.

3) BUG-03 — Role spoofing during login
   - Location: `src/services/AuthService.js`, `login.html`
   - Symptom: an attacker could request login with a role not matching the stored user and obtain a session if password matched.
   - Root cause: login only checked email+password, didn't confirm stored `role` matched requested `role`.
   - Fix applied: `AuthService.login` now throws if `user.role !== role`. Login UI continues to provide `currentRole` selection but server-side (client-side service here) enforces matching role.
   - Verification: logging in as admin requires selecting Admin; attempting Admin login with a Student account fails with 'Invalid email or password'.

4) BUG-04 — ID type mismatch when comparing IDs
   - Location: `src/services/StudentService.js`, `src/services/ComplaintService.js`, various dashboard pages
   - Symptom: lookups by ID occasionally failed due to `===` between string and number IDs (e.g., `'1' !== 1`).
   - Root cause: stored IDs could be numbers while some callers use strings, causing strict equality mismatches.
   - Fix applied: comparisons coerce both sides to `String(...)` before comparing (findIndex, filter, etc.).
   - Verification: student lookup, complaint filtering by student and complaint count computations now work reliably.

5) BUG-05 — Student search input not wired
   - Location: `admin-dashboard.html`
   - Symptom: student search input existed but had no event handler, so typing did nothing.
   - Fix applied: `setupFilters()` wires `searchStudents` input's `input` event to `filterStudents`.
   - Verification: searching students in Admin view filters the table live.

6) BUG-06 — Weak/absent Student ID validation
   - Location: `index.html`, `register.html`, `src/utils/validators.js`, `src/services/AuthService.js`
   - Symptom: registration allowed empty/too-short Student IDs which later led to duplicate or invalid records.
   - Root cause: no client-side/Service-side validation for `studentId` length/format.
   - Fix applied: `Validators.isValidStudentId` enforces minimum length; registration forms check it; `AuthService.register` validates presence and length before saving.
   - Verification: registration with `studentId` shorter than 3 chars is blocked with a clear message.

7) BUG-08 — Unsafe truncation / sanitization order
   - Location: `student-dashboard.html` (displayComplaints)
   - Symptom: truncating HTML-escaped strings after sanitization could cut HTML entity sequences or leave unsafe content when truncation happened before sanitization.
   - Root cause: earlier code truncated before sanitizing.
   - Fix applied: sanitize first, then truncate the resulting safe string.
   - Verification: complaint snippets in lists are safe, do not break markup, and show expected truncated text.

8) BUG-09 — generateId crash on invalid IDs
   - Location: `src/services/StorageService.js`
   - Symptom: `generateId` threw when existing items included undefined/NaN ids.
   - Root cause: `Math.max` used without filtering non-number ids.
   - Fix applied: `generateId` maps to Number and filters out `NaN` prior to `Math.max`.
   - Verification: new IDs are generated even if some stored items have missing/invalid id fields.

9) BUG-10 — Public pages incorrectly guarded
   - Location: `src/app.js`
   - Symptom: `register.html` was not included as a public page; unauthenticated users could be redirected away incorrectly.
   - Fix applied: `publicPages` now includes `register.html` (and empty path), so public access is allowed.
   - Verification: unauthenticated users can access the registration modal/page.

10) BUG-11 — Admin notes not cleared on status update
    - Location: `src/services/ComplaintService.js`
    - Symptom: admin could not clear notes when updating complaint (notes left unchanged if empty value provided).
    - Root cause: update logic skipped missing/empty notes.
    - Fix applied: `updateComplaintStatus` always sets `adminNotes` (uses `adminNotes ?? ''`).
    - Verification: admins can clear notes by submitting an empty string; saved complaint `adminNotes` becomes empty.

11) BUG-12 — Missing Rejected stat in student dashboard
    - Location: `student-dashboard.html`
    - Symptom: missing 'Rejected' stat card; statistics were incomplete.
    - Fix applied: Added a 'Rejected' stat card and counting logic to `updateStatistics()`.
    - Verification: Rejected complaints are now counted and displayed.

12) BUG-13 — getRelativeTime negative diffs
    - Location: `src/utils/helpers.js`
    - Symptom: if complaint `createdAt` is in the future (clock skew), `getRelativeTime` produced negative durations or odd text.
    - Fix applied: guard against negative diffs and return 'Just now' for future dates.
    - Verification: future timestamps show 'Just now' instead of negative minutes/hours.

13) BUG-14 — Stale `currentComplaintId` causing accidental updates
    - Location: `admin-dashboard.html`
    - Symptom: after closing the modal, the `currentComplaintId` could remain set and an unrelated action could update or delete it.
    - Root cause: modal close did not always clear state; backdrop click handler duplicated close logic without reset.
    - Fix applied: `closeComplaintModal()` resets `currentComplaintId = null`; route backdrop clicks through `closeComplaintModal()`.
    - Verification: after modal closes, updating/deleting actions do not run until a complaint is selected again.

---

## Manual Test Checklist (recommended steps)
Perform these manually in a browser served from a static server (see Run instructions below).

- [ ] Start app: open `index.html` (root) — verify Home shows Login/Register buttons.
- [ ] Register new student: open Register (modal or `register.html`), fill valid data (name, studentId >=3 chars, email, password >=6). Expected: success message and redirect to `login.html`.
- [ ] Login (Student): log in with new student; expect redirect to `student-dashboard.html` and name shown.
- [ ] Submit complaint: go to `submit-complaint.html`, submit valid complaint (title >=5 chars, description >=10 chars). Expected: success modal with complaint ID; complaint appears in 'My Complaints'.
- [ ] Dashboard stats: verify pending/in-progress/resolved/rejected counts update appropriately after status changes.
- [ ] Login (Admin): login with default admin `admin@portal.com` / `admin123`; expect admin dashboard.
- [ ] Admin actions: view complaint, update status and admin notes (including clearing notes), delete complaint; verify results reflected in student dashboard.
- [ ] Export data: click `Export Data` in admin — downloads JSON with students and complaints (passwords excluded from exported students list).
- [ ] Edge cases: registration with duplicate email or studentId should fail; login with wrong role should fail.

Notes: Most checks are client-side and use `localStorage` — clear storage (`App.storage.clearAllData()` in console) when needing a clean state.

---

## How to run locally (quick)

1) Serve the `portal` folder via a static server. E.g., using Python 3 built-in server from the `portal` directory:

```bash
# from the portal directory
python3 -m http.server 8000
# Open http://localhost:8000 in a browser
```

Or using `http-server` (npm):

```bash
npx http-server -c-1 . -p 8000
# Open http://localhost:8000
```

2) Perform the Manual Test Checklist in a browser. Use DevTools Console to inspect `localStorage` and run `App.storage.clearAllData()` when needed.

---

## Recommendations / Next Steps
- Add automated unit tests for services (Auth, Storage, Complaint, Student) using a JS test framework (Jest) to catch regressions.
- Add a lightweight integration test (Puppeteer / Playwright) that performs register/login/submit complaint flow.
- Consider hashing passwords before storage (even in client-side MVP) or moving auth to a server.
- Improve export to exclude any sensitive fields and add import validation schema checks.

---

If you want, I can: run the app locally here, run lint, or open issues/PRs to apply any further fixes. Tell me which action you prefer next.

---

## E2E Automated Run — 2026-05-21
I executed a full automated end-to-end smoke test in a browser against the locally served `portal` instance (http://localhost:8000). The script performed registration, student login, complaint submission, admin login, complaint status updates, clearing admin notes, deleting the complaint, and export. It also exercised edge cases (duplicate email, duplicate studentId, wrong-role login). Summary below.

- Environment: Local static server (`python3 -m http.server 8000`) serving `portal/`.
- Script: automated Playwright-like browser steps executed from the integrated browser page.

Results (high level):

- **Register student (valid data):** Passed — registration success notification shown, redirected to login.
- **Student login:** Passed — redirected to `student-dashboard.html` and student name displayed.
- **Submit complaint:** Passed — success modal shown with complaint ID.
- **Student dashboard listing & stats:** Passed — complaint appeared in 'My Complaints' and total count updated.
- **Duplicate email registration:** Passed (expected failure) — registration attempt with existing email produced an error notification saying the email is already registered.
- **Duplicate studentId registration:** Passed (expected failure) — registration attempt with an existing studentId produced an error notification about duplicate Student ID.
- **Wrong-role login (student creds as admin):** Passed (expected failure) — login attempt failed with 'Invalid email or password'.
- **Admin login (default admin):** Passed — redirected to `admin-dashboard.html`.
- **Admin update status & admin notes:** Passed — updated to 'In Progress', then cleared notes and updated to 'Resolved'.
- **Admin delete complaint:** Passed — complaint row removed from table after delete.
- **Admin export data:** Passed — `StorageService.exportData()` returned an object with `students` and `complaints` arrays; exported students list excludes sensitive fields.

Notes:
- The automation executed against the live UI and validated UI-visible outcomes (redirects, notification text, table contents). Notifications are transient; checks capture them within a short window.
- All core MVP flows worked as expected in this environment (client-side app using `localStorage`).

If you'd like, I can: attach raw run logs, save the exact complaint IDs created during the run into this file, commit a branch with automated test harness (Playwright/Jest), or start applying any remaining code fixes. Which should I do next?

---

## SQE Report — Summary & Test Matrix
Purpose: provide a concise Software Quality Engineering (SQE) level summary of verification performed on the MVP, evidence collected, outstanding risks, and recommended next steps for stabilization and CI integration.

- Environment: Local static server serving `portal/` at `http://localhost:8000` (Python `http.server` used during verification).
- Test harness: ad-hoc Playwright-like automation executed from the integrated browser plus a saved Playwright harness under `tests/e2e.spec.js` (not executed in CI here).

Test matrix (high level):

- Register student (valid data): PASS — registration succeeded and redirected to login.
- Student login (valid creds): PASS — redirected to `student-dashboard.html` and student name displayed.
- Submit complaint (valid): PASS — complaint saved to `localStorage`, visible in dashboard.
- Duplicate email registration: PASS (expected failure) — registration rejected with clear error.
- Duplicate studentId registration: PASS (expected failure) — registration rejected with clear error.
- Wrong-role login (student as admin): PASS (expected failure) — login rejected.
- Admin login (default admin): PASS — admin dashboard accessible.
- Admin update status & admin notes (including clearing notes): PASS — status changed and notes cleared correctly.
- Admin delete complaint: PASS — complaint removed from storage/UI.
- Admin export data: PASS — export object contains `students` and `complaints` arrays.

Artifacts captured during the session:

- Screenshots: landing page and dashboard captures were captured via the integrated browser and are attached inline in this session (refer to conversation images). If you want them saved into the repo, I can add them under `portal/test-artifacts/`.
- Playwright harness: `tests/e2e.spec.js` and `playwright.config.js` were added to the repo to enable repeatable runs.
- Changeset: README and `package.json` updated to document hashing/change and to provide `test:e2e` script.

Known risks & open items:

- Existing user records created before the SHA-256 hashing change still store plain-text passwords in `localStorage` and will fail to authenticate until migrated or the user re-registers. Migration script is recommended.
- This is a client-only app; hashing on the client is better than plain text but does not replace proper server-side hashing and HTTPS transport in production.
- The Playwright harness is present but not wired into CI — adding a GitHub Actions workflow to run `npm ci && npx playwright install --with-deps && npm run test:e2e` is recommended.

Recommended next steps (SQE):

1. Add a short migration script to re-hash existing plain-text passwords (or require re-registration), and verify migration with tests.
2. Commit test artifacts (screenshots, run logs) to `portal/test-artifacts/` for traceability.
3. Add a CI job (GitHub Actions) to run the Playwright tests on push/PR against a simple static-server step.
4. Add unit tests for `StorageService`, `AuthService`, and `ComplaintService` (Jest) to prevent regressions in core logic.

Reproduce E2E locally (commands):

```bash
cd portal
npm install
npx playwright install --with-deps
npm run test:e2e
```

If you want, I can now: (A) run the Playwright suite here and attach logs/screenshots, (B) commit artifacts (screenshots, logs) into `portal/test-artifacts/`, or (C) implement a small migration to re-hash existing users. Tell me which option to do next.
