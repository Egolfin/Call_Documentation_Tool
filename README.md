# Call documentation tool

A standalone HTML app for documenting calls. Select one response for each field, review the live note, then copy. Guidance is available under “When to use”. All 11 fields and 63 responses come from the supplied workbook's Guide tab.

## Run locally

Extract the ZIP and open `index.html` in a modern browser. No installation, server, Google account, or build step is needed. If clipboard access is blocked, the app attempts browser copy and then selects the note for manual copying.

## Upload to GitHub and publish

1. Sign in to your preferred GitHub account and create a repository.
2. Upload the extracted files to the repository root. `index.html` must be at the root, not inside an extra folder. Commit the files.
3. Open repository **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose **main** and **/(root)**, then save.
6. Open the site URL shown by GitHub Pages after deployment finishes.

A static GitHub Pages deployment does not provide application login. Choose repository/site visibility appropriate for your team's data. No call notes are transmitted or saved by this app. The deployed Guide is a static snapshot and does not automatically synchronize with Google Sheets.

GitHub reference: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Daily workflow

- Select every field. No response is selected automatically.
- Expand “When to use” to read the exact selected response's guidance.
- `Other:` under `If Not Achieved, What Stopped It?` requires a nonempty explanation. Leading/trailing whitespace is removed, as in the original tool.
- Review the note and click **Copy completed note**, or press **Ctrl+Enter** / **Command+Enter**.
- Click **New call**. Uncopied selections require confirmation. After copying an unchanged note, reset is immediate.
- Use Tab to move between controls and arrow keys to choose native dropdown options.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Semantic app layout |
| `styles.css` | Desktop and mobile styling |
| `app.js` | Rendering, validation, note creation, copy and reset |
| `guide.js` | Editable disposition data |
| `guide-source.json` | Original extracted Guide rows for comparison |
| `verify.cjs` | Dependency-free Node.js data regression check |
| `VERIFICATION.md` | Checks performed and remaining browser checks |

## Maintaining the Guide

Edit `guide.js` to update fields, responses and guidance. Preserve the array order to preserve note order. All options render dynamically. `app.js` contains only the existing exact-name `Other:` special case, not new business rules.

The snapshot in `guide-source.json` is independent of the app dataset. Keep it unchanged when checking against the original workbook. For an approved Guide revision, replace the snapshot with the authoritative new rows and review the change.

Run `node verify.cjs` to compare the app data with the original snapshot. Node.js is only needed for this optional developer check, not to run the app.

## Implementation assumptions

All Guide fields remain mandatory even if a previous answer seems to make a later field irrelevant. No conditional business rules, suggested dispositions or automatic substitutions were added. Fields are grouped by first appearance, options retain row order, blank guidance remains blank in the dataset, and extraction trims strings exactly as the original Apps Script does. Notes live only in memory in the current tab and clear on page reload.
