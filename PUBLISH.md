# Publication Status

2026-10-25: studio redesign complete locally, 5710 matrix checks passed. Not deployed.

GitHub Credential Manager requires a fresh login. The remote main branch still
points to the older website commit. No password/token is stored in this project.

After signing in through Git Credential Manager, run:

```powershell
git -C "D:\codex\網站製作\calculator-website" push origin main
```

Then verify the GitHub Pages build succeeds and the public page has the feature
editing story, material close-up, three themes, Liquid Glass switch and FAQ:

https://yogaliu0818.github.io/calculator-website/

For local preview, open index.html. No dependency install or server is needed.
