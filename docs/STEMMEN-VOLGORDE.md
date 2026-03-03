# 🎙️ Stemmen Volgorde Mandate (2026)

Dit document bevat de gewenste volgorde van de stemmen per taal binnen het Voices-ecosysteem. 
De volgorde wordt bepaald door het **Chris-Protocol** (Discipline) en de **Bob-methode** (UX).

## 🛠️ Sorteer Logica (Single Source of Truth)

De `VoiceFilterEngine` hanteert de volgende hiërarchie voor de sortering:
1.  **Menu Order (Admin Override)**: Handmatige volgorde ingesteld door Johfrah (1 = eerste, 0 = geen override/laatste).
2.  **Market-Aware Language Priority**: Prioriteit voor de moedertaal van de actuele markt (bijv. nl-be voor België).
3.  **Nuclear Speed Priority**: Acteurs met een hoge leveringsprioriteit.
4.  **Actual Availability**: Beschikbaarheid op basis van de `delivery_date_min`.
5.  **Voice Score (Populariteit)**: De natuurlijke populariteitsscore van de stem (Hoger = Eerder).
6.  **Alfabetisch**: Tie-breaker op basis van voornaam.

---

## 🇧🇪 Vlaams (nl-be)
De kern van de Belgische markt. De volgorde is gebaseerd op een mix van sales-historie en strategische prioriteit.

1.  **Mark** (Heyninck) (Score: 980) ⭐
2.  **Christina** (Score: 595) 👑
3.  **Johfrah** (Score: 590)
4.  **Korneel** (Score: 573)
5.  **Kristien** (Score: 565)
6.  **Serge** (Score: 540)
7.  **Gitta** (Score: 530)
8.  **Mona** (Score: 520)
9.  **Patrick** (Score: 510)
10. **Laura** (Score: 510)
11. **Hannelore** (Score: 510)
12. **Birgit** (Score: 510)
13. **Veerle** (Score: 510)
14. **Sen** (Score: 510)
15. **Annelies** (Score: 500)
16. **Kirsten** (Score: 375)
17. **Toos** (Score: 100)
18. **Larissa** (Score: 100)

## 🇳🇱 Nederlands (nl-nl)
De kern van de Nederlandse markt. Volledig sales-driven volgorde.

1.  **Mark** (Labrand) (Score: 1000) 👑
2.  **Ruben** (Score: 980) 🚀
3.  **Gwenny** (Score: 970) 📈
4.  **Kristel** (Score: 960) 📈
5.  **Youri** (Score: 950)
6.  **Ilari** (Score: 950)
7.  **Klaas** (Score: 199)
8.  **Lonneke** (Score: 199)
9.  **Ronald** (Score: 190)
10. **Petra** (Score: 190)
11. **Jakob** (Score: 180)
12. **Bart** (Score: 180)
13. **Lotte** (Score: 180)
14. **Sven** (Score: 180)
15. **Carolina** (Score: 160)
16. **Machteld** (Score: 105)
17. **Dunja** (Score: 100)

---

*Laatste update: 22 februari 2026*
