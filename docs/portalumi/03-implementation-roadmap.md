# portaLumi real implementation roadmap

Dátum: 2026-10-03

## Fejlesztési workflow

Minden nagyobb feladat külön sub-branchen készül.

Flow:
sub-branch
→ implementáció
→ ellenőrzés
→ squash
→ egy commit a portalumi-demo branchre

A main csak stabil mérföldkőnél frissül.

## 0. fázis — domain demo lezárása

Cél:
A DB előtt véglegesítsük az alapfogalmakat.

Elkészült / demóban megjelenik:
- 3 előre definiált 3 hónapos program
- programonként reggeli + esti authored sequence
- minden sequence 12 sorrendben rögzített alkalom
- user napválasztás hétfőtől vasárnapig
- hétvége engedélyezett
- nincs kötelező program_week domain objektum
- user csak teljes reggeli / esti sequence-t cserél
- creator programcsomagokat definiálhat
- creator kurzusokat és leckéket kezelhet

Demo adat:
src/assets/demo/program-templates.json

## 1. fázis — auth + Laravel API alap

Döntés a sprint elején:
- Clerk integráció véglegesítése

Preferált:
- Clerk passwordless
- nincs saját device-token auth

Laravel:
- /api/v1
- DB kapcsolat
- CORS
- egységes API válaszok
- Clerk token ellenőrzés

Első táblák:
- users
- roles
- user_roles
- creator_profiles

Kész, ha:
- bejelentkezett Clerk userhez saját portaLumi user rekord tartozik
- GET /api/v1/me működik

## 2. fázis — creator kurzusok valódi DB-ben

Táblák:
- courses
- course_units

Funkciók:
- course create / edit
- draft / publish
- unit create / edit / delete
- media URL
- media upload
- cover URL
- cover upload

Frontend:
- ApiCourseRepository
- ApiCreatorRepository

Kész, ha refresh után minden creator adat megmarad.

## 3. fázis — authored sequences

Táblák:
- content_sequences
- content_sequence_items

Funkciók:
- creator új sequence-t készít
- morning / evening típus
- meglévő course unitok hozzáadása
- sorrend szerkesztése creator oldalon
- publish után a sorrend a user számára locked

Kész, ha egy 12 alkalmas felépített sorozat DB-ből betöltődik és a sorrend stabil.

## 4. fázis — creator program templates

Táblák:
- program_templates
- program_template_tracks

Funkciók:
- program template létrehozása
- cím, leírás
- teljes reggeli sequence kiválasztása
- teljes esti sequence kiválasztása
- publish

Első seed programok:
1. Energikusabb mindennapok
2. Magabiztosság
3. Megnyugvás / lelki béke

Kész, ha a user programválasztó már DB-ből kapja a három csomagot.

## 5. fázis — user program példány

Táblák:
- user_programs
- user_program_tracks
- user_program_days

Funkciók:
- kész template kiválasztása
- kiválasztott napok mentése
- hétvége támogatása
- teljes morning sequence csere
- teljes evening sequence csere
- start_date
- end_date csak ha valóban szükséges

Nincs duration_weeks mező.

Kész, ha a user saját programbeállítása refresh után is megmarad.

## 6. fázis — napi program és progress

Táblák:
- user_sequence_progress

Funkciók:
- következő sequence item meghatározása
- Mai program
- morning / evening feladat
- complete / skip
- saját válasz
- progress 1 / 12 formában

A "hét" legfeljebb UI-csoportosítás, nem domain-kényszer.

## 7. fázis — reflexió és check-in

Táblák:
- reflections
- checkins

Funkciók:
- opcionális lesson reflection
- időszakos checkpoint
- review
- korábbi válaszok visszatöltése

## 8. fázis — affirmations

Tábla:
- affirmations

Funkciók:
- javasolt megerősítés
- user módosíthatja
- elfogadás
- később saját hang feltöltése
- cadence

## 9. fázis — ajánlás és AI

Csak a stabil adatmodell után.

Első kör:
- szabályalapú template ajánlás

Később AI:
- program ajánlás
- feedback alapján következő program
- személyes affirmation
- creator metaadatok intelligens használata

Fontos:
Az AI nem keverheti össze önkényesen egy creator által felépített sequence belső sorrendjét.

## Következő konkrét sprint

A demo program-template változtatások után:

1. Clerk döntés + integrációs proof of concept
2. Laravel /api/v1 alap
3. users + roles
4. GET /me
5. Angular API auth interceptor
6. creator courses DB migráció

Ezután jön a sequences + program templates DB réteg.
