# Content TODO

Production build fails while any item has `draft: true`. Review each item, edit the copy, then set `draft: false`.

## Facts to confirm (copied from résumé / spec 5.1)
- [ ] Résumé PDF is a placeholder (`public/resume.pdf`, includes phone number by Saran's decision). Replace the file when updated.
- [ ] Email, LinkedIn, GitHub, PRs (180 / 100 / 200 = 480 kg at 68 kg) are set; `personal.ts` is `draft: false`.
- [ ] Role titles and dates (`experience.ts`) match the résumé; the `summary` lines are Claude drafts.

## Draft items (Claude-written copy, all `draft: true`)
- [ ] `site.ts`: headline, subline, intro (About mini card), status chip
- [ ] `projects.ts`: ask-introhive (all sections, tagline, og)
- [ ] `projects.ts`: introhive-mcp (all sections; timeline "Ongoing" is a neutral placeholder; confirm start of MCP test work)
- [ ] `projects.ts`: plant-as-battery (all sections; timeline "Fall 2026" and team "Senior design team" need confirming; GitHub repo is private, so no link)
- [ ] `projects.ts`: slang-or-not (all sections; timeline "Fall 2026" and team "Course team" need confirming; stack list is minimal)
- [ ] `experience.ts`: the five role summaries
- [ ] `stack.ts`: grouped skills (taken from résumé; confirm)

## Missing assets
- [ ] `site.photo`: Saran's photo (SC monogram is the fallback)
- [ ] Real project media (videos/images) for all four projects; placeholder SVG art is used until then
- [ ] Slang-or-Not results and metrics once experiments finish
- [ ] Plant as Battery: real photos / system diagram
- [ ] Introhive MCP: confirm the public-page wording
- [ ] Per-project OG images (`public/og/`)

## Questions from review
- [ ] `site.ts` subline says "I work on production RAG..." (present tense). Confirm present tense is accurate for the part-time role.
- [ ] "Introhive ML/AI team" (`projects.ts` team field and the ask-introhive overview) is not on the résumé. Confirm the team name or drop it.
- [ ] Plant as Battery timeline: `projects.ts` says "Fall 2026 – present" while this file says "Fall 2026". Reconcile.
- [ ] Slang-or-Not example word "salty" (`projects.ts` overview) was invented by Claude. Replace it with one of the team's actual target words.
- [ ] Status chip (`site.ts`) says "ML Engineer (part-time)" but the title is "Associate Machine Learning Engineer". Use the full title or confirm the short form.
