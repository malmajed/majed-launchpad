# Launchpad — session handoff

Last updated: 2026-10-05 · Status: **four career tracks live (62 missions, 16 cases) + full CFA program: Level I (20), Level II (16), Level III (22 = 10 core + 12 pathway) with exam simulator. 120 missions total. CFA section relabelled "Investment Foundations (CFA-aligned)" + CFA study tracker on the 2027 outline. Build v11.**

## What it is
Family learning PWA (single-file HTML) at https://malmajed.github.io/majed-launchpad/
Profiles: Majed, Mohammed, Lamess, Lena (picker on launch, optional PIN per profile).
Four tracks of missions: Learn (concept cards) → Lab → Test (6 MCQ, options shuffled) → Reflect → Read.
Plus: dashboard, XP/levels (Associate→Partner), badges, Leitner spaced review, weekly goals,
case of the week (4 Harvard-style cases, rotates weekly), online rooms (Case Sprint duel, partner case),
Family standings, read-only Follow page (follow.html) with profile selector.

## State of the build
- Batch 1 DONE: app shell + Consulting track c01–c15 (7 case sims, 12 labs), 4 cases of the week.
- Batch 2 DONE: MBA Core m01–m16 (labs_mba.js, data_mba.js), cases w05–w08 (cases_mba.js). calcLab + plotXY helpers live in labs_mba.js — reuse them.
- Batch 3 DONE: Engineering e01–e16 (labs_eng.js with classifyLab helper, data_eng.js), cases w09–w12 (cases_eng.js).
- Batch 4 DONE: Entrepreneurship s01–s15 (labs_startup.js with canvasLab helper, data_startup.js), cases w13–w16 (cases_startup.js). Full regression of all 62 missions passed.
- Link helpers HBRS/INV/OCW/DAMO/WIKI live in app.js (track files load alphabetically, so shared helpers must be in core files).
- Approved mission lists are in `TRACKS[].titles` in `build/src/app.js` (titles are fixed; keep ids m01.. e01.. s01..).
- Each batch should also add 4 more cases of the week to `CASES` (fictional GCC companies, illustrative data).

- CFA Level I DONE (build v8): `labs_cfa1.js`, `data_cfa1.js` (a01–a20, 10 three-option MCQs each, `topic` tag per mission). `exam.js` = exam simulator (`#/exam`, `#/exam/cfa1|cfa2|cfa3`), samples by `m.topic` weights, tops up short topics from the rest of the bank, auto-saves MCQ-only results to `state.exams`.
- CFA Level II DONE (build v9): `labs_cfa2.js` (lab key `ratetree`, not `tree` — that is a Consulting lab), `data_cfa2a.js` (b01–b08, defines `tbl()` table helper), `data_cfa2b.js` (b09–b16). Missions have `sets:[{t,v,topic?,qs:[4]}]`; `addMissions` derives `m.quiz` from sets (with `stem`/`setT`) and stepTest shows the vignette. Exam picks sets weighted by topic (`pickSets`). Test: `/home/claude/test9.js cfa2`.
- CFA Level III DONE (build v10): `labs_cfa3.js`, `data_cfa3a.js` (x01–x10 core), `data_cfa3b.js` (x11–x22 pathways; `topic:'path'`, `path:'pm'|'pmk'|'pw'`). Each mission: 1 item set + 4 MCQs (`quiz`, appended after set questions) + 2 constructed responses `cr:[{q,model,pts,topic?}]`. `crPractice()` in app.js shows CR practice after the mission test. Exam: pathway selector (saved in `state.cfaPath`), `buildExam(tr,mode,pw)` filters pathway items.
- Link helper gotcha: `INV()` already prefixes `terms/`; Investopedia blocks curl (402) so prefer verifiable links.
- CFA content is ORIGINAL, aligned to CFA Institute's published topic outline/weights (2026). Never copy curriculum text. Code & Standards per 2023 revision (effective 1 Jan 2024: I(E) Competence; VI(A) Avoid or Disclose Conflicts).
- Tests: `/home/claude/test7.js` (Level I missions/labs/quizzes), `test8.js` (exam simulator), server on 8766.

- CFA STUDY TRACKER (build v11, after charterholder feedback that the CFA missions were too shallow for exam prep): `cfa_outline.js` = CFAO, 2027 topic names/weights and learning-module titles parsed from CFA Institute's 2027 topic outline PDFs (L1 102 modules, L2 51, L3 28 core + PM 8 / PMK 7 / PW 7); titles + LO counts only (outlines are marked not for distribution). `study.js` = `#/study/<lv>`: per-module read/practice(q,c)/confidence/last-review in `state.cfa.m['lv:topic:i']`, hours `state.cfa.hrs[[ts,h,lv,mod]]`, mocks `state.cfa.mk[[ts,lv,score,src]]`, exam dates `state.cfa.date`. Mastery = .35 read + .45 acc×min(1,q/20) + .2 conf/5, ×.85 if >45 days stale; readiness = weighted by topic midpoints, blended 60/40 with avg of last 2 mocks. Follow page shows `studySummaryHTML`. Practice simulator uses 2027 weights. Tests: /home/claude/t13.js.

## Files
- `build/src/core.js` — launchpad-kit core (sync, photos, DUEL). Patched only for: per-profile USER/LSKEY, `user` in push/pull/photo, duel `current.id` crash fix. Chess engine removed.
- `build/src/app.js` — shell: router, views, profiles, SRS, goals, case of week, settings, follow.
- `build/src/engine.js` — case simulator `runSim`, case-math `genMath`, exhibits, rooms (duel + partner).
- `build/src/labs_consult.js`, `sims_consult.js`, `data_consult.js`, `cases.js` — Consulting content.
- New batches: add `build/src/labs_mba.js` + `data_mba.js` etc. The build auto-includes extra .js files (alphabetical, after the core files).
- Mission object shape: see any entry in `data_consult.js` (id, track, title, blurb, mins, lab{key,name,intro,sim?}, cards[5], quiz[6]{q,o,a,w}, srs[4]{q,a}, read[3]{t,s,n?,u}).
- `build/make.py v3` → rebuilds `index.html`, `follow.html`, bumps the `sw.js` cache name. Always bump the version.
- `build/Code.gs` — Apps Script backend v4 (per-profile sheets: `state`/`summary` for Majed, `state_<user>`/`summary_<user>` for others; activity has a User column). SECRET is set only in the live script, never in the repo.
- `build/test/mock.js` (mock backend, port 8767) + `test3.js` (Playwright profile test). Serve the repo root with `python3 -m http.server 8765`.

## Deploy
Push to `main` → GitHub Actions `pages.yml` deploys (Pages source = GitHub Actions, already set).

## Gotchas learned
- Apps Script: editing an existing deployment did NOT pick up new code for the owner; **Deploy → New deployment** works. The URL changes, so it must be re-entered in Settings on each device (or via the device link).
- The Sync URL/secret are per device, shared by all profiles on that device.
- Owner instructions: one step at a time, English only, objective first, detailed sub-steps when he asks.
- Reflections default private to the device; each profile can share them via Settings.
- The weekly email report was declined — do not set up `setupWeeklyTrigger`.

## Next action
None scheduled. Possible extensions: more cases of the week, Arabic glossary, more partner-case sims, per-mission notebook export.
