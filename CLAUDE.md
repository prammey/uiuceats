# UIUC Eats — project rules

- **Auto commit and push.** After a change passes lint, build, and tests, commit and push to `main` without asking (Prameet, 2026-10-09: "always auto commit and push"). Vercel deploys from `main`. Still run the secret scan before every commit, and never commit `.env*`.
- Root `/` is the only route; the page is built from `components/final/`.
- The collector bot commits `data/` every 3 hours; always `git pull --rebase` before pushing.
- Project name is UIUC Eats everywhere: GitHub repo `prammey/uiuceats` and Vercel project `uiuceats` (both renamed from `foodplease` / `uiucfood` on 2026-10-13). Do not rename either without asking.
