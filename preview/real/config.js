// Runtime config — editable without rebuilding (served no-cache).
// Browser code uses ANON/publishable only. NEVER put SERVICE_ROLE here.
//
// CI/default: DEMO_MODE true keeps CI e2e hermetic (never touches a real DB).
// Deployment (JOBS/018): the deploy step swaps this file in the SERVED copy
// (dist/) to the Supabase cloud project with DEMO_MODE:false — repo default
// stays demo-safe.
window.SE_CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",
  API_BASE: "",
  DEMO_MODE: true,
  ENABLE_GOOGLE: true,
  GOOGLE_MAPS_API_KEY: "",
  // JOBS/083 — display-only label for the DB-dump backup destination
  // (backup-db.yml pushes to this public repo; no secret involved).
  GITHUB_BACKUP_REPO: "aase7en/sunday-estate-backups",
};
