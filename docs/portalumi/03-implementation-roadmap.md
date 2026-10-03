# portaLumi real implementation roadmap

Dátum: 2026-10-03

## Alapelv

Nem írjuk újra a jelenlegi UI-t.

A demo képernyőket fokozatosan kötjük valódi Laravel API-hoz.

Minden nagyobb fejlesztés külön sub-branchen készül, majd ellenőrzés után egy squash commitként kerül a portalumi-demo branchre.

## 0. fázis — stabil kiindulópont

Cél:

A jelenlegi demo legyen referencia.

Feladatok:

- demo snapshot dokumentálása
- v1 adatmodell dokumentálása
- implementációs roadmap rögzítése
- jelenlegi frontend repository interfészek megtartása
- demo JSON marad fallback / seed forrás

Késznek tekinthető, ha:
- dokumentáció bent van a repóban
- következő fejlesztői lépések egyértelműek

## 1. fázis — Laravel API alap

Cél:

Legyen egy működő /api/v1 réteg és valódi adatbázis.

Feladatok:

- routes/api.php
- API controller struktúra
- MySQL / MariaDB konfiguráció
- UUID alapú modellek
- egységes JSON response formátum
- API exception handling
- CORS beállítás

Első migrációk:

- users
- user_sessions
- roles
- user_roles
- creator_profiles

Késznek tekinthető, ha:
- Laravel migráció lefut
- API health endpoint működik
- frontend eléri az API-t

## 2. fázis — username-only belépés

Cél:

Valódi user legyen, de még ne legyen email és jelszó.

Flow:

első megnyitás
→ username
→ bootstrap API
→ device token
→ token localStorage
→ GET /me

Feladatok:

- bootstrap user endpoint
- session token generálás
- token hash tárolás
- Angular auth/session service
- HTTP interceptor
- /me endpoint

Fontos:

A username önmagában ne legyen autentikáció.

A device token azonosítsa a felhasználót.

Késznek tekinthető, ha:
- browser refresh után ugyanaz a user töltődik vissza
- másik browser külön userként jelenik meg
- nincs email / password UI

## 3. fázis — creator és course adatbázis

Cél:

A content creator felület ne JSON-ból működjön.

Migrációk:

- courses
- course_units

Feladatok:

- creator profile API
- course list API
- course create
- course edit
- course publish / draft
- course unit create
- course unit edit
- course unit reorder
- course unit delete

Frontend:

- ApiCourseRepository
- ApiCreatorRepository
- JSON repository leváltása creator módban

Késznek tekinthető, ha:
- új kurzus DB-be mentődik
- refresh után is megmarad
- leckék módosítása DB-ben marad

## 4. fázis — valódi média

Cél:

Videó, hang és borítókép valóban feltölthető legyen.

Feladatok:

- Laravel upload endpoint
- file validation
- MIME és size limit
- public/storage vagy privát media kiszolgálás
- URL forrás támogatása
- media_path / media_url kezelés
- cover_path / cover_url kezelés

Első körben:

- local Laravel Storage

Később:

- S3-kompatibilis storage

Késznek tekinthető, ha:
- creator feltölt egy audio vagy videó fájlt
- refresh után is lejátszható
- külső URL is használható
- borítókép upload és URL is működik

## 5. fázis — onboarding valódi mentése

Cél:

A kérdőív válaszai DB-ben legyenek.

Migráció:

- user_profiles

Feladatok:

- GET profile
- PUT profile
- onboarding válaszok autosave
- onboarding complete flag

Késznek tekinthető, ha:
- másik route-ra lépés után nem vész el adat
- refresh után visszaáll
- backendből jön az összefoglaló

## 6. fázis — program generálás v1

Cél:

A 12 hetes program ne statikus JSON legyen.

Migrációk:

- programs
- program_weeks
- program_items

Első algoritmus:

1. user célok és akadályok
2. preferált formátum
3. heti rendelkezésre álló idő
4. kurzus recommendation metadata
5. egyszerű pontszám
6. tartalom kiválasztás
7. 12 hetes sorrend

Még nem kell LLM.

Késznek tekinthető, ha:
- két eltérő profil eltérő programot kap
- program DB-ben tárolódik
- refresh után ugyanazt a programot kapja vissza

## 7. fázis — aktuális hét és haladás

Migráció:

- user_unit_progress

Feladatok:

- current week API
- daily items
- complete / skip
- task response mentés
- progress bar valós adatokból

Késznek tekinthető, ha:
- Mai feladatok valódi programból jönnek
- kattintáskor valódi course unit nyílik
- teljesítés tartósan mentődik

## 8. fázis — reflexió és check-in

Migrációk:

- reflections
- checkins

Feladatok:

- opcionális lesson reflection
- 2 hetes / havi checkpoint
- review adatok mentése
- programhoz kapcsolás

Késznek tekinthető, ha:
- visszajelzés nem sessionStorage-ben van
- review oldalon valódi korábbi adatok jelennek meg

## 9. fázis — következő ciklus

Cél:

Az előző program eredményei alapján új ciklus induljon.

Első körben szabályalapú:

- completion rate
- check-in
- manuális prioritásváltás
- felhasználói módosítás

Később AI segíthet a finomhangolásban.

## 10. fázis — valódi auth

Csak akkor, amikor már szükséges.

Lehetséges sorrend:

1. email + magic link
2. email + password
3. Apple / Google

A már meglévő passwordless user rekordokat ehhez kell hozzákötni, nem lecserélni.

## Első konkrét implementációs sprint

A következő fejlesztési kör szerintem pontosan ez legyen:

1. Laravel API route struktúra
2. users + user_sessions + roles migráció
3. username-only bootstrap endpoint
4. GET /me
5. Angular ApiUserRepository
6. auth/session interceptor
7. demo user JSON leváltása

Ez egy jól körülhatárolható vertical slice:

frontend
→ Laravel API
→ valódi DB
→ ugyanaz a user refresh után is

Ha ez működik, utána mehet a creator + course adatmodell.
