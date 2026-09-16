# Riemann Hypothesis Autonomous Tracker

![Status](https://img.shields.io/badge/System-Autonomous-emerald)
![Platform](https://img.shields.io/badge/Platform-GitHub_Actions-blue)
![Dashboard](https://img.shields.io/badge/UI-React-cyan)

<div dir="rtl">

## סקירה (Overview)
פרויקט זה מריץ מערכת אוטונומית במעגל סגור (Closed-Loop) לאיתור וחיפוש של פתרונות להשערת רימן (Riemann Hypothesis). המערכת מתבססת באופן מלא על התשתיות של GitHub Actions כפלטפורמת השרתים (Compute) שלה, ומשתמשת ב-GitHub Pages כדי להציג את נתוני החישוב בזמן אמת על גבי דשבורד ויזואלי.

### כיצד התהליך עובד (GitHub Actions Loop)
המערכת מורכבת מ-3 פעולות מרכזיות (Workflows) הפועלות בסנכרון מוחלט:
1. **Orchestrator Loop (`orchestrator.yml`)**:
   המנהל של המערכת. הוא מופעל אוטומטית כל 6 שעות (או בזמן עדכון קוד/דחיפה). הוא דוגם את הנתונים העדכניים ומייצר **מטריצת עבודה דינמית**. כלומר, הוא מחלק את טווחי הסריקה הבאים לפלחים ומעביר אותם במקביל לשלב הבא.
2. **Execution Worker (`worker_execution.yml`)**:
   אלו מנועי החישוב בפועל. ה-Orchestrator מריץ אותם במקביל. כרגע מוגדרים שני מנועים:
   * **חישוב נומרי (Numerical)**: רץ ב-C++/Rust כדי למצוא שורשים על הישר הקריטי באמצעות פונקציית Z(t) של הארדי.
   * **אימות פורמלי (Formal)**: רץ ב-Lean 4 בניסיון לגזור אוטומטית למות והוכחות תיאורטיות מהספרייה הקיימת.
   התוצאות שלהם נארזות ל-Artifacts (קבצי JSON).
3. **Dashboard Deploy (`dashboard_deploy.yml`)**:
   ברגע שה-Orchestrator מסיים לאסוף את כל התוצאות מה-Workers, תהליך זה מתעורר. הוא אוסף את כל ה-Artifacts החדשים אל תיקיית הנתונים, מקמפל את אפליקציית ה-React מחדש וזורק אותה ל-GitHub Pages.

### כיצד להשתמש בדשבורד (Dashboard Usage)
הדשבורד משמש כתחנת הבקרה הויזואלית שלך לראות מה המערכת "חושבת" כרגע.
* **החלפת שפה:** בראש הדף קיים כפתור להחלפה מהירה בין עברית לאנגלית.
* **הסברים (Tooltips):** ליד כל רכיב מידע (למשל: "גובה סריקה נוכחי", "אפסים מאומתים", או בגרפים) תמצא אייקון סימן שאלה (❔). רפרוף עם העכבר על האייקון יציג הסבר מפורט מה הרכיב אומר וכיצד הוא פועל.
* **יומן ניסיונות:** בתחתית הדף תמצא טבלה המרכזת את כל הרצות ה-GitHub Actions האחרונות, ניתן לסנן אותה להצגת הוכחות פורמליות לעומת חישובים נומריים.

</div>

---

<div dir="ltr">

## Overview
This project runs a closed-loop autonomous system to track and compute roots for the Riemann Hypothesis. It leverages GitHub Actions as its core compute infrastructure and GitHub Pages for real-time dashboard tracking and analytics.

### GitHub Actions Pipeline
The automated loop runs entirely within GitHub Actions across three primary workflows:
1. **Orchestrator Loop (`orchestrator.yml`)**:
   The brains of the operation. Triggered via a cron schedule (every 6 hours) or on pushes to `main`. It generates a dynamic execution matrix based on the latest checkpoint to assign chunks of calculations.
2. **Execution Worker (`worker_execution.yml`)**:
   A reusable workflow invoked by the Orchestrator. It spins up parallel jobs:
   * **Numerical Engine**: Calculates roots along the critical line.
   * **Formal Prover**: Uses Lean 4 and Mathlib to verify and generate mathematical lemmas.
   Results are uploaded as JSON artifacts.
3. **Dashboard Deploy (`dashboard_deploy.yml`)**:
   Listens for the Orchestrator to finish. It downloads all generated artifacts, aggregates the `state.json` and `experiments.json`, rebuilds the React/Vite application, and deploys it directly to GitHub Pages.

### How to use the Dashboard
* **Localization:** Use the toggle button in the header to switch between Hebrew (RTL) and English (LTR).
* **Tooltips:** Hover over the help icon (❔) next to any widget (KPIs, Charts, Logs) to read detailed explanations about what the metric means and how it functions within the pipeline.
* **Experiment Journal:** Use the filter tabs above the table to isolate specific run types (Numerical vs. Formal Provers).

</div>
