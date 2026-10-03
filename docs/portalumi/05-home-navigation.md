# portaLumi főoldal és user navigáció

Dátum: 2026-10-03

## Cél

A portaLumi user ne közvetlenül a kérdőívbe érkezzen, hanem egy főoldalra, ahonnan a teljes termékstruktúra elérhető.

A főoldal nagy, egyértelmű kártyákból áll.

## Fő navigáció

### Custom program / Saját programom

Alapállapotban:
- Custom program
- a kérdőíves flow indul
- célok
- helyzet
- preferenciák
- napok
- profil
- program összeállítása

Ha a user már kiválasztott egy programot:
- a kártya neve Saját programom
- a program neve is megjelenik
- kattintás a finomhangoláshoz visz

Ha a program már elindult:
- Saját programom
- progress jelenik meg
- például 2 / 12
- kattintás a Mai programhoz visz

## Programok

Minden önálló, sorrendben felépített authored sequence listája.

Példák:
- reggeli breathwork
- esti meditáció
- NLP sorozat
- pozitív megerősítéses program

A programokra kattintva az összes alkalom előnézhető.

A belső sorrend a user számára nem rendezhető át.

## Csomagok

Előre összeállított programcsoportok.

Egy csomag például:
- egy teljes reggeli program
- egy teljes esti program

A demo 3 csomagot tartalmaz:
1. Energikusabb mindennapok
2. Magabiztosság
3. Megnyugvás / lelki béke

A Csomagok oldalon külön Custom program gomb is van, amely elindítja a kérdőíves flow-t.

## Előadók

Minden előadó listája.

Előadói profil:
- név
- szakterület
- rövid bio
- hozzá tartozó programok
- hozzá tartozó kurzusok

A program kattintható és a 12 alkalom előnézhető.

## Események

Első körben placeholder.

Később:
- workshop
- előadás
- online esemény
- helyszín
- időpont
- előadó
- jelentkezés

## Profi segítség

Első körben placeholder.

Később:
- ellenőrzött szakemberek
- szakterületek
- 1:1 konzultáció
- kapcsolatfelvétel

## Hírek

V3 funkció.

Előadók később rövid tartalmakat és frissítéseket publikálhatnak.

Lehetséges tartalom:
- új program
- rövid írás
- videó
- esemény
- fontos bejelentés

A demo főoldalon látszik, de V3 jelöléssel jelenleg inaktív.

## Útvonalak

- /home
- /programs
- /packages
- /presenters
- /presenters/:slug
- /events
- /professional-help

Custom program onboarding:
- /goals
- /questionnaire/situation
- /questionnaire/preferences
- /profile-summary
- /generating

Aktív program:
- /program/customize
- /week
- /lesson
- /feedback
- /review

## Progress

A user program állapota külön tárolódik:

- started
- currentPosition

A főoldalon csak elindított programnál jelenik meg progress.

A program progress nem demo screen index és nem kötelező hét-szám.

Jelenlegi demo:
- 1 / 12
- 2 / 12
- stb.

A Mai program a currentPosition alapján választja ki a reggeli és esti sequence aktuális elemét.

## Fontos domain különbség

Program:
egy önálló, sorrendben felépített sequence.

Csomag:
egy vagy több teljes programból összeállított user-facing ajánlat.

Custom program:
kérdőív alapján kialakított saját útvonal.

A user nem keveri át egy szakmailag felépített program belső sorrendjét.
