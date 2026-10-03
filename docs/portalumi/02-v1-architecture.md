# portaLumi v1 architecture

Dátum: 2026-10-03

## Cél

A demo UI megtartása mellett átállni valódi, perzisztens adatokra.

Első körben nem építünk teljes klasszikus autentikációt.

Nem kell:
- e-mail
- jelszó
- jelszó-visszaállítás
- OAuth

A felhasználó számára az első verzióban elég egy név / username.

A háttérben azonban kell egy biztonságos azonosító, hogy az adatok ne csak a username alapján legyenek elérhetők.

## Javasolt belépési modell v0

Első indítás:

1. a felhasználó megad egy username-et
2. frontend: POST /api/users/bootstrap
3. Laravel létrehoz egy user rekordot
4. Laravel generál egy véletlen device/session tokent
5. a frontend eltárolja a tokent localStorage-ben
6. minden API kérés Bearer tokennel megy

Példa:

Authorization: Bearer <device-token>

A token nyers formában csak a kliensen legyen.

Az adatbázisban csak hash kerüljön eltárolásra.

Ez nem klasszikus account login, de már valódi user-szeparációt ad.

Később ugyanahhoz a userhez hozzáadható:

- email
- password_hash
- Apple / Google login
- több eszköz

Anélkül, hogy a user adatait migrálni kellene.

## Backend

Laravel maradjon a backend.

Javasolt szerkezet:

laravel/
- app/Models
- app/Http/Controllers/Api
- app/Http/Requests
- app/Services
- app/Policies
- database/migrations
- database/seeders
- routes/api.php

Az API legyen verziózott:

/api/v1/...

## Adatbázis

MySQL vagy MariaDB.

### users

- id UUID
- username
- email nullable
- password nullable
- status
- created_at
- updated_at

A username kezdetben lehet display name jellegű. Ne ez legyen az autentikációs kulcs.

### user_sessions

- id UUID
- user_id
- token_hash
- device_name nullable
- last_seen_at
- expires_at nullable
- created_at

### roles

- id
- code

Kezdeti értékek:

- user
- content_creator

### user_roles

- user_id
- role_id

Azért pivot tábla, mert ugyanaz a user több szerepet is kaphat.

## Content creator adatmodell

### creator_profiles

- id
- user_id
- display_name
- bio
- specialty
- avatar_path nullable
- created_at
- updated_at

### courses

- id UUID
- creator_id
- title
- slug
- category
- description
- level
- total_duration_minutes nullable
- best_time nullable
- status draft / published / archived
- topics JSON
- formats JSON
- recommendation_metadata JSON
- engagement_settings JSON
- created_at
- updated_at

A JSON mezők az első verzióban szándékosan egyszerűek.

Később, ha ténylegesen szükséges SQL-ben keresni / súlyozni őket, normalizálhatók külön tag táblákba.

### course_units

- id UUID
- course_id
- position
- title
- type
- duration_minutes nullable
- summary nullable
- source_mode upload / url
- media_url nullable
- media_path nullable
- cover_mode upload / url
- cover_url nullable
- cover_path nullable
- metadata JSON nullable
- created_at
- updated_at

Típusok:

- video
- audio
- exercise
- meditation

## Felhasználói onboarding adatok

### user_profiles

- user_id
- main_goal
- long_term_goal
- situation
- obstacles JSON
- weekly_time
- preferred_formats JSON
- pace
- created_at
- updated_at

A profil később bővíthető új mezőkkel úgy, hogy a kérdőív nem feltétlenül egyetlen fix sémához kötődik.

## Program adatmodell

### programs

- id UUID
- user_id
- title
- status draft / active / completed
- duration_weeks
- current_week
- generated_from JSON
- started_at nullable
- completed_at nullable
- created_at
- updated_at

### program_weeks

- id UUID
- program_id
- week_number
- title
- focus
- position

### program_items

- id UUID
- program_week_id
- course_unit_id nullable
- type
- title
- time_of_day
- cadence nullable
- position
- metadata JSON nullable

time_of_day:

- morning
- daytime
- evening

## Progress és reflexió

### user_unit_progress

- id
- user_id
- program_item_id
- status pending / completed / skipped
- response_text nullable
- completed_at nullable

### reflections

- id
- user_id
- program_item_id nullable
- program_id nullable
- text
- created_at

### checkins

- id
- user_id
- program_id
- period_key
- rating nullable
- difficulty nullable
- change_text nullable
- note nullable
- created_at

### affirmations

- id
- user_id
- program_id nullable
- text
- accepted_at nullable
- audio_path nullable
- cadence nullable
- active
- created_at

## Médiafájlok

Első körben:

Laravel Storage

Példa:

storage/app/public/
- courses/{course-id}/units/{unit-id}/media/
- courses/{course-id}/units/{unit-id}/covers/
- users/{user-id}/affirmations/

Adatbázisba relatív path kerüljön, ne teljes domain URL.

Később ugyanaz a Laravel Storage API átállítható S3-kompatibilis storage-ra.

## Frontend adat-hozzáférés

A jelenlegi repository interfészeket megtartjuk.

Példa:

CourseRepository
- JsonCourseRepository most
- ApiCourseRepository később

ProgramRepository
- JsonProgramRepository most
- ApiProgramRepository később

UserRepository
- JsonUserRepository most
- ApiUserRepository később

CreatorRepository
- JsonCreatorRepository most
- ApiCreatorRepository később

Így a UI nem tudja, hogy JSON-ból vagy API-ból érkezett az adat.

## API első kör

### bootstrap / session

POST /api/v1/users/bootstrap
GET /api/v1/me

### onboarding

GET /api/v1/me/profile
PUT /api/v1/me/profile

### courses

GET /api/v1/courses
GET /api/v1/courses/{id}

Creator:

POST /api/v1/creator/courses
PUT /api/v1/creator/courses/{id}
POST /api/v1/creator/courses/{id}/publish

### course units

POST /api/v1/creator/courses/{course}/units
PUT /api/v1/creator/units/{id}
DELETE /api/v1/creator/units/{id}

POST /api/v1/creator/units/{id}/media
POST /api/v1/creator/units/{id}/cover

### programs

GET /api/v1/me/programs
GET /api/v1/me/programs/{id}
POST /api/v1/me/programs

### progress

PUT /api/v1/me/program-items/{id}/progress
POST /api/v1/me/reflections
POST /api/v1/me/checkins

## Fontos döntés

Az első valódi verzióban még nem kell AI.

A program-generálás kezdetben lehet deterministic / szabályalapú.

Például:

user profile
→ cél + akadály + idő + formátum
→ kurzus metaadatok pontozása
→ legjobb tartalmak kiválasztása
→ 12 hétre kiosztás

Az AI később ráépülhet erre a struktúrára.
