Migration: Re-hash existing plain-text passwords (browser console)

Purpose:
If you previously stored user passwords in plain text in `localStorage` (`students_data` and `admins_data`), run the following migration in the browser console while the app is loaded (open DevTools -> Console on a page served from the `portal/` folder). This will detect passwords that are not 64-char hex (SHA-256) and replace them with their SHA-256 hash using the app's `Helpers.hashPassword` function.

Steps (in browser console):

(async () => {
  if (typeof Helpers === 'undefined' || typeof Helpers.hashPassword !== 'function') {
    console.error('Helpers.hashPassword not available. Ensure /src/utils/helpers.js is loaded.');
    return;
  }

  function looksHashed(pw) {
    return typeof pw === 'string' && /^[0-9a-f]{64}$/.test(pw);
  }

  const keys = ['students_data', 'admins_data'];
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    const arr = JSON.parse(raw);
    let changed = false;
    for (const u of arr) {
      if (u && u.password && !looksHashed(u.password)) {
        const h = await Helpers.hashPassword(u.password);
        u.password = h;
        changed = true;
      }
    }
    if (changed) {
      localStorage.setItem(key, JSON.stringify(arr));
      console.log(`Migrated passwords in ${key}`);
    } else {
      console.log(`No plain passwords detected in ${key}`);
    }
  }
  console.log('Migration complete.');
})();

Notes:
- This migrates only the data present in the browser's `localStorage` for the current origin.
- Make a backup: use the app's Export Data flow first (Admin -> Export) or run `localStorage.getItem('students_data')` and save the JSON externally.
- After running the migration, existing sessions may need to re-login.
