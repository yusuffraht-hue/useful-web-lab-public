# Useful Web Lab

Two free browser-local projects: Screenshot Cleaner and Signal Garden. No application accounts, telemetry, paid APIs, or backend are required.

## Build and test

Use Node 24, Python 3, and Playwright. Run `npm ci`, `npm test`, `npx playwright install chromium webkit`, and `npm run test:browser`. The preview serves the final static output at `dist/site`. Browser tests cover screenshot batch redaction and exports, and solve and reset the puzzle.

## Release and recovery

The default-branch GitHub Actions workflow builds and tests the published artifact before automatic deployment to GitHub Pages. Pull requests run the same tests without deployment. Scheduled runs test daily and check the published HTML against its release manifests hourly. Health checks retry once. Check the Actions tab and GitHub notification settings for failures.

To recover, identify the last successful release from the deployment history. Revert the failing change on the default branch to redeploy the known-good source through tests. If GitHub Pages becomes unavailable, build the known-good revision and deploy `dist/site` to an approved static host. Set `LIVE_URL` to the new origin and change the release adapter. No provider-specific logic is required by either app.

## Add a project

Add an isolated static app under `apps/`. Register its build, package it as a subdirectory in `dist/site`, add a browser test for its main action, and register its health URL. A project integrated into the default branch becomes public once the shared release passes. Keep private prototypes and user data outside this repository. Keep employment of new providers or billing behind owner approval.

Use reproducible feedback or failures to pick improvements. Record the problem, alternatives, success criteria, test evidence, and rollback point. Usage is currently unmeasured. Hourly checks detect regressions but do not author changes. Reassess free limits, schedule health, and provider availability periodically.

## Decision history

Screenshot Cleaner established the test and deployment path. Signal Garden reused the same path and passed a Chromium browser playtest. The public release repository starts with clean commit metadata to preserve the privacy of the original development history.
