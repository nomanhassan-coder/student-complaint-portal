# Student Complaint Portal — JSON-Based System

## Overview
Fully offline student complaint management. Pure JavaScript + OOP + localStorage. No backend needed.

## Features
- Student registration/authentication
- Complaint submission with categories
- Admin dashboard for management
- Status tracking (Pending, In Progress, Resolved, Rejected)
- Real-time statistics
- Search/filter functionality
- Data export/import (JSON)
- Completely offline

## Tech Stack
- HTML5, CSS3, JavaScript (ES6+)
- localStorage (browser storage)
- OOP architecture (Models, Services, Controllers)

## Installation
1. Extract zip file
2. Open `index.html` in browser (Chrome/Firefox/Edge)
3. Done. No npm, no build, no server.

## Default Login
**Admin:**
- Email: admin@portal.com
- Password: admin123

**Student:**
- Register new account via registration page

## Bug Fixes (v1.1)

| ID | Severity | File | Issue | Fix |
|----|----------|------|-------|-----|
| BUG-01 | Critical | Complaint.js | `fromJSON` crashed trying to write `#private` fields from a static method | Added `_restore` constructor param; `fromJSON` passes saved values through it |
| BUG-02 | Critical | User.js / Student.js | `fromJSON` never restored `createdAt` — date reset to "now" on every reload | Constructor accepts optional `createdAt`; `fromJSON` passes it through |
| BUG-03 | Critical | AuthService.js | Role was client-controlled; calling `login(email,pw,'admin')` in console bypassed student table | After finding user, verified `user.role === role` before accepting login |
| BUG-04 | Critical | admin-dashboard.html, StudentService.js | Strict `===` between string/number IDs caused all students to show as "Unknown" | Coerced both sides with `String()` before comparison throughout |
| BUG-05 | High | admin-dashboard.html | Student search input had no `addEventListener` — search box did nothing | Added `document.getElementById('searchStudents').addEventListener('input', filterStudents)` |
| BUG-06 | High | register.html, index.html, validators.js | Student ID format never validated; blank IDs accepted | Added `Validators.isValidStudentId()` and called it in both register forms |
| BUG-07 | High | StorageService.js | Passwords stored as plain text in localStorage | Fixed: passwords are now hashed (SHA-256) before storage and comparison. Default admin password stored as SHA-256 of `admin123`. |
| BUG-08 | High | student-dashboard.html | `getDescription().substring(0,100)` before `sanitize()` could leave partial HTML tags | Flipped order: `sanitize(description).substring(0,100)` |
| BUG-09 | High | StorageService.js | `Math.max(...ids)` returned `NaN` when any `item.id` was undefined; `NaN+1=NaN` corrupted all IDs | Filter out `NaN` values before `Math.max`; return `1` if no valid IDs |
| BUG-10 | Medium | app.js | `register.html` missing from `publicPages`; double-redirect for unauthenticated users | Added `'register.html'` to the public pages array |
| BUG-11 | Medium | ComplaintService.js | `if (adminNotes)` check skipped setter when notes were cleared; old notes persisted | Changed to unconditional `complaint.setAdminNotes(adminNotes ?? '')` |
| BUG-12 | Medium | student-dashboard.html | No "Rejected" stat card; rejected complaints invisible in breakdown | Added Rejected stat card and counter to `updateStatistics()` |
| BUG-13 | Low | helpers.js | Negative `diffInSeconds` (clock skew) produced "-1 minutes ago" | Added `if (diffInSeconds < 0) return 'Just now'` guard |
| BUG-14 | Low | admin-dashboard.html | Backdrop click hid modal but skipped `currentComplaintId = null` reset | Routed `window.onclick` through `closeComplaintModal()` |

## OOP Concepts

### Encapsulation
- Private fields using `#` syntax
- Public getters/setters with validation

### Inheritance
- `Student` extends `User` base class

### Abstraction
- Service layer abstracts storage ops
- Models abstract data structure

### Polymorphism
- `toJSON()` method overriding
- Factory pattern with `fromJSON()`

## Data Storage
Browser localStorage with keys:
- `students_data` — All students
- `complaints_data` — All complaints
- `admins_data` — Admin accounts
- `current_user` — Current session

## Project Structure
```
student-complaint-portal/
├── index.html
├── login.html
├── register.html
├── student-dashboard.html
├── admin-dashboard.html
├── submit-complaint.html
├── css/
│   └── styles.css
├── src/
│   ├── models/
│   │   ├── User.js
│   │   ├── Student.js
│   │   └── Complaint.js
│   ├── services/
│   │   ├── StorageService.js
│   │   ├── AuthService.js
│   │   ├── StudentService.js
│   │   └── ComplaintService.js
│   ├── utils/
│   │   ├── validators.js
│   │   └── helpers.js
│   └── app.js
└── README.md
```

## Limitations
1. Storage limit: ~5–10 MB (browser dependent)
2. Data cleared if user clears browser cache
3. Passwords are now stored as SHA-256 hashes. This improves safety over plain text but is not a substitute for server-side authentication.
4. No concurrent user conflict resolution
5. No cross-tab real-time sync

## Browser Support
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## License
Open source for educational purposes.

## Automated Tests (E2E)
This repo now includes a simple Playwright-based E2E test under `tests/e2e.spec.js` and an npm script to run it. Install dependencies and run from the `portal` folder:

```bash
npm install
npx playwright install --with-deps
npm run test:e2e
```

The E2E test performs a register → login → submit complaint flow against a locally served instance (run `python3 -m http.server 8000` in the `portal` folder first).
# student-complaint-portal
