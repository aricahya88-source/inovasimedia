/**
 * Tidak memakai .env.
 * Setelah Apps Script dideploy sebagai Web App, tempel URL /exec di sini.
 * Spreadsheet ID dan Folder ID TIDAK pernah diletakkan di frontend.
 */
export const SERVER_CONFIG = Object.freeze({
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzGWIseTxpW6LL2GbeXznksVCal3ZtN-j7uiCcEZ3YtXphELg_aqjB6XgO7ZR9_pYCn/exec',
  REQUEST_TIMEOUT_MS: 60000,
  MAX_UPLOAD_BYTES: 3 * 1024 * 1024
});
