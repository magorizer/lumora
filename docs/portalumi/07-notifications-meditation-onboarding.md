# portaLumi értesítések és meditációs onboarding

Dátum: 2026-10-03

## Értesítések

Új user menüpont:

- Értesítések
- route: /notifications

A demo oldalon a user beállíthatja, hogy mely időablakban szeretne értesítéseket kapni.

Alapértelmezett időablak:

- 09:00
- 21:00

A két óraszám kis inputként szerkeszthető.

Az oldalon szereplő tájékoztató szöveg lényege:

- ahogy a user halad a programmal, az értesítések változhatnak
- bármelyik értesítés átírható
- bármelyik törölhető

Demo értesítések:

1. Zseniális vagyok.
2. Ha van időd, állj meg egy fél percre, és figyelj befelé.
3. Mosolyogj, és figyeld meg, mi történik a testedben.

A demo beállítások localStorage-ben maradnak meg.

A valódi push notification scheduling még nincs implementálva.

## Meditációs tapasztalat onboardingban

A helyzetfelmérő kérdőív új kérdése:

Meditáltál már?

Válasz:

- Nem
- Igen

Ha Igen:

- Kezdő
- Haladó
- Zen

Az értékek bekerülnek a UserAnswers demo állapotába és a személyes profil összefoglalóban is megjelennek.
