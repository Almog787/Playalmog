# Game Theory Master: Unbeatable Tic-Tac-Toe & Connect 4
## מנוע תורת המשחקים: איקס-עיגול ו-4 בשורה בלתי מנוצחים

An advanced, interactive Game Theory application containing mathematically unbeatable AI solvers for **Tic-Tac-Toe** (Strongly Solved) and **Connect 4** (Weakly Solved), with real-time Minimax tree evaluation, heatmaps, positional threat detection, and comprehensive mathematical proof encyclopedias.

---

### 🇮🇱 תכונות המערכת (Hebrew)
1. **איקס עיגול בלתי מנוצח (Tic-Tac-Toe)**:
   - מנוע Minimax מלא עם משקלי עומק (בלתי ניתן לניצחון לעולם – תמיד כופה תיקו או מנצל טעויות לניצחון).
   - מפת הערכות בזמן אמת (Heatmap) על כל משבצת בלוח (ניצחון, תיקו, הפסד).
   - מד יתרון עמדתי חי (Evaluation Bar).
   - אנציקלופדיית פתיחות ומלכודות קלאסיות (מלכודת פינות נגדיות, משולש, הענשת צלעות).

2. **4 בשורה פתור מתמטית (Connect 4)**:
   - מבוסס על הוכחת ויקטור אליס (1988) – שחקן ראשון (אדום) שפותח במרכז (עמודה 4) מנצח בהכרח תוך 41 מהלכים.
   - מנוע Alpha-Beta Pruning עמוק עם זיהוי איומים מיידי, מניעת שגיאות פטאליות (Blunders) ולוח משקלים מרכזי.
   - הערכת ציון לכל עמודה בשידור חי.
   - שכבת "חוק הזוגיות" (Parity Law) המדגישה שורות זוגיות מול אי-זוגיות.

3. **אקדמיית תורת המשחקים וחוקר עץ החלטות (Minimax Decision Tree)**:
   - הסבר מקיף על משפט המינימקס של ג'ון פון נוימן (1928), שיווי משקל נאש (Nash Equilibrium) ודרגות פתרון משחקים.
   - הדמיה ויזואלית חיה של עץ ההחלטות והצמתים המחושבים.
   - תמיכה מלאה בעברית ובאנגלית (כולל RTL).

---

### 🇬🇧 Key Features (English)
- **Unbeatable Minimax Engine**: Deep search and memoized state lookup that guarantees zero losses.
- **Real-Time Column & Cell Evaluation**: Visual overlays showing exact game-theoretic values (+Win, 0 Draw, -Loss).
- **Interactive Solved Traps**: Test classic forks, zugzwangs, and parity counters interactively.
- **Decision Tree Visualizer**: Explore the minimax branches, pruning points, and principal variation.
- **Audio Synthesizer**: Clean Web Audio API sound effects with confetti on game completion.
