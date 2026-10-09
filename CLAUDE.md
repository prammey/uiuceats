# UIUC Eats — project rules

- **Auto commit and push.** After a change passes lint, build, and tests, commit and push to `main` without asking (Prameet, 2026-10-09: "always auto commit and push"). Vercel deploys from `main`. Still run the secret scan before every commit, and never commit `.env*`.
- Root `/` is the final merged look (`components/final/`). `/A` and `/B` are kept for reference; `/fonts` is a private pairing gallery.
- The collector bot commits `data/` every 3 hours; always `git pull --rebase` before pushing.
- Project name is UIUC Eats. The folder and repo still say `foodplease`; do not rename them without asking (Vercel is wired to the repo).
