HAM RADIO EXAM PRACTICE — 2026–2030 UPDATE
================================================

WHAT TO REPLACE
---------------
Replace these three files in the root of your existing GitHub Pages repository:

  index.html
  sw.js
  manifest.json

Keep your existing icon files:
  icon-192.png
  icon-512.png
  icon-512-maskable.png
  apple-touch-icon.png
  favicon-32.png

WHAT CHANGED
------------
1. Uses the complete current 2026–2030 Technician pool (409 questions at the
   time this update was built).

2. Mock Exam now draws one random question from each of the 35 official
   question groups, for a 35-question exam.

3. Mock Exam does not reveal correctness after each question. It grades at
   the end and uses 26/35 as the passing threshold.

4. Practice Mode uses the full pool and gives immediate feedback.

5. Questions with figures automatically display T-1, T-2, or T-3.

6. "Review Missed" is available from the results screen.

7. The 35-step question ladder is used for Mock Exam only. Practice Mode uses
   a compact progress panel instead of trying to render 409 ladder rungs.

8. The PWA service worker caches the question pool and all three diagrams.
   The app also stores a copy of the pool in localStorage as a second offline
   fallback.

QUESTION DATA
-------------
The NCVEC Technician question pool is public domain.

This app loads the JSON conversion maintained at:
https://github.com/russolsen/ham_radio_question_pool

The app validates:
  - at least 400 complete question records
  - exactly 35 exam groups
  - unique question IDs
  - four answers per question
  - the February 19, 2026 corrected wording for:
      T1C01
      T5A05
      T7A09
      T0A10

FIRST-RUN / OFFLINE BEHAVIOR
----------------------------
The first visit should be made while online. The pool and diagrams will be
downloaded and cached. After that, the PWA can use its cached copy offline.

DEPLOYING TO GITHUB PAGES
-------------------------
1. Back up your current repository.
2. Replace index.html, sw.js, and manifest.json with these versions.
3. Commit and push to the branch GitHub Pages already serves.
4. Open the site while online.
5. If an installed PWA or old browser tab still shows the previous version,
   close it and reopen/reload it. The new service worker uses a new cache name
   and deletes the old cache during activation.

NOTES
-----
The app intentionally keeps your original no-framework, single-page approach.
No npm build step, server, database, or API key is required.
