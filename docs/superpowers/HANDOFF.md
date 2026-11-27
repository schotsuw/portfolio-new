# Handoff — portfolio build (2026-11-26)

Branch `build`. Done and reviewed: plan Tasks 1–11 (Task 11 fix round re-reviewed clean).

## Remaining
All plan tasks, the deferred minors, and the final whole-branch review with its fix wave are done and re-reviewed clean. Results: unit 189, e2e 28/28 on chromium and webkit, Lighthouse 100/100. `build` was squashed into one commit on top of `main` to purge internal names from public history.

1. Live preview check: the Vercel preview is behind Deployment Protection. Open it while logged in, confirm a direct load of `/projects/slang-or-not` works, and check that the page source has the per-route `og:title`.
2. Vercel project settings: confirm Node 24 is selected/supported. CI and `engines` pin `>=24`.
3. Clear CONTENT_TODO.md, including its "Questions from review" section. Then merge `build` → `main`. The draft guard blocks production until then.
4. Optional: delete the stray `send_later` trigger left by an earlier session's subagent.

## Content Saran must review (CONTENT_TODO.md)
All Claude-drafted copy is `draft: true`; production build refuses to publish until cleared. Notably: headline/subline wording, status chip (use full title "Associate Machine Learning Engineer"?), Slang-or-Not example word + timeline, team labels, photo.

## Resume locally
`git clone -b build https://github.com/schotsuw/portfolio-new && npm i && npm run dev` (tests: `npm test`, e2e: `npx playwright install && npm run e2e`). Run the plan with superpowers:subagent-driven-development; the progress ledger is the file above.
