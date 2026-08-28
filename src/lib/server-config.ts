/**
 * Tidak memakai .env.
 * Setelah Apps Script dideploy sebagai Web App, tempel URL /exec di sini.
 * Spreadsheet ID dan Folder ID TIDAK pernah diletakkan di frontend.
 */
export const SERVER_CONFIG = Object.freeze({
  APPS_SCRIPT_URL: 'PASTE_APPS_SCRIPT_WEB_APP_URL_HERE',
  REQUEST_TIMEOUT_MS: 60000,
  MAX_UPLOAD_BYTES: 3 * 1024 * 1024
});
