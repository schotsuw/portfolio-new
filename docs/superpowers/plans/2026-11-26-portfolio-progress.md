# SDD ledger — plan: docs/superpowers/plans/2026-11-26-portfolio.md
Spec: docs/superpowers/specs/2026-11-26-portfolio-design.md
Branch: build (base 0e107af docs commit). Repo schotsuw/portfolio-new, Vercel project portfolio-new.

## Pre-flight scan
| Pair / task | Produces vs consumes | Finding |
|---|---|---|
| T1 | build script `... && tsx scripts/postbuild.ts` | postbuild.ts doesn't exist until T11 → build fails in T1 |
| T3 ↔ T5 | T3 ThemeToggle "glass"; GlassButton made in T5 | T3 would consume an interface not yet built |
| T3 ↔ T6 | ThemeToggle → Overlay | ok after reorder |
| T4 ↔ T6/T7/T9 | closeOverlay, Link, useRoute, navigate | consistent names |
| T2 ↔ T7/T9/T11 | getProject, adjacentProjects, allContentItems, site, personal | consistent; order ask-introhive,plant,slang,mcp; wrap matches T9 test |
| T7 ↔ T8 | cards → DesktopGrid | ok |
| T11 | OG PNGs written to public/og after vite build | public/ already copied → images would miss dist |
| T12 / T1 | Playwright projects chromium+webkit | sandbox has only Chromium (/opt/pw-browsers), no WebKit, downloads blocked |
| T12 | Lighthouse | needs Chrome: /usr/bin/google-chrome exists |
| T1 | fonts download | GitHub clone works: /tmp/open-runde/src/web/*.woff2 + LICENSE.txt |
| each task self-consistency | tests vs code vs files | T2–T10 internally consistent; T11 see above |

## Rulings
- Ruling: run order 1,2,5,3,4,6,7,8,9,10,11,12,13 — ThemeToggle (T3) needs GlassButton (T5) — cost if wrong: none, tasks independent otherwise.
- Ruling: T1 `build` = `tsc -b && vite build`; T11 appends `&& tsx scripts/postbuild.ts` — script doesn't exist yet — cost: trivial.
- Ruling: T11 writes OG PNGs to `dist/og/<id>.png` (gitignored output), og:image = `https://saranchotsuwan.com/og/<id>.png` — public/ is copied before postbuild — cost: none.
- Ruling: Playwright keeps chromium+webkit projects; sandbox runs `--project=chromium`; T12 adds `.github/workflows/ci.yml` running unit + e2e on both browsers, checked via gh api after T13 push — WebKit can't be installed here — cost: WebKit failures found later, after push.
- Ruling: pushing branch `build` to origin in T13 is authorized — user created repo + Vercel and agreed to build branch/preview flow — never push main.
Task 1: complete (commits 0e107af..b229477, review clean). Tokens: bg-page/card/media, text-ink/ink-2, border-line; accent #ff6b4a; shipped #2fbf71; progress #64b5f6.
  Parked minors → T11/T12: replace Vite favicon with original SC favicon; drop stray package.json "typescript" key; tsconfig.node include scripts/ + tests/e2e; theme.test.ts cwd-relative path; vitest/globals type vs globals:false. Note: tests/unit/theme.test.ts exists (tokens) — T3 should name its test theme-provider.test.tsx.
Task 2: Ruling: plan-mandated "What I built" heading over platform list overclaims vs résumé "developed features on" — rename to "What I worked on" and phrase items as contributions — spec §2 anti-goal (overclaiming) outranks plan wording — cost if wrong: none.
Task 2: minor (deferred): allContentItems omits link hrefs + media paths from lint
Task 2: minor (deferred): MCP never-built check only covers role; extend to all project:introhive-mcp text
Task 2: minor (deferred): subline present-tense "I work on production RAG..." — flag for Saran in CONTENT_TODO
Task 2: minor (deferred): "Introhive ML/AI team" not on résumé — confirm with Saran
Task 2: minor (deferred): Plant timeline "Fall 2026 – present" vs TODO "Fall 2026" wording mismatch
Task 2: minor (deferred): Slang example "salty" invented; check SlangTrack's 10 target words / use team's own example
Task 2: minor (deferred): Slang stack lists dataset as stack
Task 2: minor (deferred): adjacentProjects throws on unknown slug → T4/T9 callers must guard (carried into T9 dispatch)
Task 2: fix round 1/5 (1 addressed, 0 open — "What I built" overclaim; commits 0d1f4c9..ac9c330)
Task 2: complete (commits b229477..ac9c330, review clean). Re-review OOS note: geography/export/guardrail-UI/dependency items trace to spec §5.1 inventory list (allowed) — no action.
Task 5 note: .bottom-gradient-blur needs 5 empty <span> children (carry to T10)
Task 5: minor (deferred): pairing test counts @supports line; thin coverage of chip dot mapping / prop leakage; BottomBlur component for 5 spans (carry to T10); --glass-shadow var vs class name. Trailer "Opus 5.5" is correct per session attribution — no action.
Task 5: fix round 1/5 (2 addressed, 0 open — angle inheritance, dark accent specificity; commits 06668c9..faa6225). Re-review conditional (chip tint) checked: GlassChip has no tint prop → no regression.
Task 5: complete (commits ac9c330..faa6225, review clean)
CONTROLLER ERROR: briefs are numbered by PLAN task number (task-N-brief = plan Task N). Theme implementer got task-4-brief (Router) by mistake; re-reviewing theme against task-3-brief.
Plan Task 3 (theme): Ruling: ThemeProvider wired in main.tsx instead of App.tsx — accepted, equivalent behaviour — cost: none. Commit-message wording deviation accepted.
Plan Task 3: minor (deferred): head-script tests lack stored-dark/light-system and matchMedia-throws cases; cwd-relative readFileSync; no live system-preference listener.
Plan Task 3: fix round 1/5 (2 addressed, 0 open — THEME_SCRIPT export + verbatim test; commits 80712bb..49f558e)
Plan Task 3: complete (commits faa6225..49f558e, review clean)
Plan Task 4: fix round 1/5 (2 addressed — replace drops fromHome, Link external hrefs; commits c8a0d5e..ed45b27)
Plan Task 4: fix round 2/5 (1 addressed — jsdom nav noise; commits ed45b27..902824e)
Plan Task 4: minor (deferred): hash-only hrefs treated as internal; unknown-slug Link URL/view mismatch
Plan Task 4: complete (commits 49f558e..902824e, review clean)
Plan Task 6: fix round 1/5 (3 addressed — overflow refcount, shared Lenis refcount, topmost Esc; commits a0a011e..d37b06a). registerOverlayOpen returns {release,isTop}.
Plan Task 6: minor (deferred): zero-focusable + reduced-motion fade not unit-tested; focus restored during exit animation; no matchMedia change listener for Lenis.
Plan Task 6: complete (commits 902824e..d37b06a, review clean)
Plan Task 7 note → T8 ruling: About mini + Experience mini side-by-side only at xl (≥1280), stacked at lg; site.intro field added (draft).
Plan Task 7: complete (commits d37b06a..c0295f3, review clean)
Plan Task 7: Ruling: short UI chrome labels (Stack, Experience, About me, Personal bests, Read my résumé) may be hardcoded — they make no factual claims; implementer-rules already allowed UI labels.
Plan Task 7: minor (deferred): AboutMini long link name (aria-hidden monogram); CareerRuler touch-none blocks vertical scroll (use touch-pan-y); clock dial raw hex vs tokens; no cleanup test for rAF/interval; copy status re-announce; presentYear uses local year; ExperienceMini comment; block+flex; ProjectVideo autoplay under reduced motion.
Plan Task 7: minor (deferred, CONTENT): statusChip "ML Engineer (part-time)" vs title "Associate Machine Learning Engineer" — mild title inflation; fix to use full title or flag.
Plan Task 8: Ruling: accept implementer's column reshuffle (Ruler+Clock → col1, Stack → col3) — spec §8.1 lets builder rebalance as long as Ask tall top-left + hero top-centre; columns now flush. Controller observation: AboutMini monogram renders as an empty grey circle in screenshots — check in review.
Plan Task 8: complete (commits c0295f3..768d56a, review clean). Monogram "empty" = screenshot timing artifact (wait ≥2s).
Plan Task 8: minor (deferred → T12): grow on Slang/Plant over-stretches art panels at 1024; Hero flex-1 centering leaves ~300px dead space; loose heroIdx test; Hero + footer duplicate GitHub/LinkedIn.
Plan Task 9: complete (commits 768d56a..90ee726, review clean)
Plan Task 9: minor (deferred): no test Close after Prev/Next → home; Prev/Next doesn't move focus/announce (focus h1 tabIndex=-1); org+title grouping heuristic; redundant ul aria-labelledby.
Plan Task 10: fix round 1/5 (1 addressed — dock above modal; commits 84d2376..1f8aa3c)
Plan Task 10: minor (deferred): blur positive assertion on home; disconnect + reduced-motion 'auto' tests.
Plan Task 10: complete (commits 90ee726..1f8aa3c, review clean)
NOTE: re-review subagent created stray send_later trigger trig_01UZuNa3ykdMbNa4wsuiUYz7 ("placeholder") and its delete was denied; NOT deleting on its behalf — surfaced to user.
Plan Task 11: fix round 1/5 (3 addressed; commits ddc96ac..f005feb). Plan Task 11: complete (commits 1f8aa3c..f005feb, review clean)
Task 12b: review → Needs fixes. Open: (I1) CaseStudy.tsx h1 focus on Prev/Next scrolls past scrollTop reset → use focus({preventScroll:true}) + test spy; (spec item 8) CareerRuler "no timers" test vacuous → drop/mark guard. Queued until 12a fix round finishes (one implementer at a time).
Task 12b: minor (deferred): cards.test aria-hidden monogram check vacuous (assert svg exists first); dial token test only asserts no-hex (assert fill-media class); ProjectVideo autoPlay={!reduced} doesn't play() if reduced-motion turns off later; GlassChip no-leak test thin. Clock dial visual equivalence (fill-media/stroke-ink/10 vs old hex) → check in T12 screenshots.
Task 12a: fix round 1/5 (1 addressed, 0 open — jsdom nav noise in router link tests; commits 4f8e0b0..3d9310d). Item-9 non-RED test addressed via 12b item 17.
Task 12a: complete (commits 7ac3327..3d9310d, review clean)
Task 12b: fix round 1 implemented (c07b244); scoped re-review dispatched. Task 12c: dispatched (BASE c07b244, implementer sonnet af36b616a6b6b1a87)
Task 12b: fix round 1/5 (2 addressed, 0 open — h1 focus preventScroll, vacuous ruler test; commits 3d9310d..c07b244)
Task 12b: complete (commits 50e94c6..c07b244, review clean; 4f8e0b0 + c07b244 are 12b, 3d9310d is 12a's fix interleaved)
Task 12c: implementer done e275fd9 (Slang stack → ['NLP']; projectText() exported); review dispatched
Task 12c: complete (commits c07b244..e275fd9, review clean)
Task 12c: minor (deferred): corpus test checks projectText output only, not the lint regex; projectText exported for test; long site line.
Task 12: dispatching (BASE e275fd9, implementer opus; context file task-12-context.md)
Task 12: implementer opus afb00c11ea0a54088 running
Task 12: implementer done (0825216, 74b2ffe). e2e chromium 28/28, webkit 28/28; Lighthouse / mobile+desktop 100/100. Product fixes: stretched title link (axe label-in-name), compositor transform for reveal (TBT), font preloads (CLS). vite.config preview plugin emulates Vercel /x → x/index.html — verify on Vercel preview in T13.
Ruling: accept hero first in col 2 with About/Experience stacked below; footer keeps GitHub/LinkedIn, hero's removed — §8.1 allows rebalancing if Ask tall top-left + hero top-centre — cost if wrong: layout tweak.
Task 12: complete (commits e275fd9..74b2ffe, review clean)
Task 12: minor (deferred): RF5 band checked only at 1024/1152 (fine per brief viewports); og:title regex assumes attr order; ci.yml lts/* unpinned, no concurrency/timeout; getAnimations wait may hang to timeout; text blocks checked horizontally only. Preview plugin mirrors Vercel dir-index → confirm on preview (T13).
Task 13: start — push `build` only (never main), check Vercel preview + CI.
Task 13: pushed build e522dc0. Vercel preview build: success. GitHub Actions CI run 45935479597: success (lint, tsc, unit, e2e chromium+webkit).
Task 13: BLOCKED (needs Saran): preview alias https://portfolio-new-git-build-schotsuws-projects.vercel.app returns 302 → Vercel SSO (Deployment Protection), so live route checks (direct /projects/slang-or-not = 200, per-route og:title) can't run unauthenticated. Options: Saran checks in a logged-in browser, disables protection for previews, or provides a Protection Bypass for Automation secret.
Remaining after T13: final whole-branch review (opus; triage all "minor (deferred)" lines above), then merge build → main only after Saran clears CONTENT_TODO.md.
Final review: dispatched (opus, range 6865c3b..e9deffe) 2026-11-27
Final review (opus): With fixes. Critical C1: repo is PUBLIC and tests/spec/plan contain literal internal Introhive names (main is clean; only build carries them; commit messages clean). Important I2 light-mode focus-ring contrast <3:1; I3 mobile Contact section has no contact option. Minors 4-13 + 60-row deferred triage (none of the deferred minors must-fix).
Ruling: final fix wave covers C1 (tree only: hashed denylist + redacted docs), I2, I3, M4-M7, M9-M12 — skip M8 (résumé gating: content decision tracked in CONTENT_TODO) and M13 (dormant until media exists) — cost if wrong: small follow-ups.
Ruling: purging the names from build's history needs a force-push → owner's authorization; not done by controller unilaterally — cost: names stay reachable in old commits until then.
User decision 2026-11-27: squash build into one clean commit on main and force-push build only, after the fix wave is re-reviewed.
Final fix wave: implemented e9deffe..9918a7b (7 commits); scoped re-review dispatched
Final fix wave re-review: all 11 findings ADDRESSED, no new Critical/Important (commits e9deffe..9918a7b). Unit 189, e2e 28/28 chromium+webkit, build clean.
Final: parked — fonts unhashed but cached 1y immutable — Ruling: accept; rename the font file on any future change — cost: stale font for returning visitors if replaced in place.
Final: parked — config.test CI regexes brittle to YAML reformatting; MobileDock buttons use browser-default focus ring; matcher misses names embedded inside longer tokens; Vercel Node 24 support unverified (check project settings) — Ruling: non-blocking minors — cost: small follow-ups.
