# portaLumi v1 architecture

Dátum: 2026-10-03

## Alapelv

A demo UI-t nem írjuk újra. A most kialakított domain-modellt fokozatosan kötjük valódi Laravel API-hoz és adatbázishoz.

Frontend:
- Ionic
- Angular
- Capacitor

Backend:
- Laravel
- PHP
- MySQL / MariaDB

Média:
- első körben Laravel Storage
- később S3-kompatibilis storage

## Auth

A saját username + device-token rendszer helyett a jelenlegi preferált irány Clerk, hogy ne építsünk saját autentikációs rendszert.

Első körben jelszó nélküli belépést érdemes használni:
- email kód / magic link
- vagy Google / Apple

A portaLumi adatbázisban ettől függetlenül saját user rekord marad:

### users
- id UUID
- clerk_user_id unique
- display_name
- status
- created_at
- updated_at

A Clerk kezeli az identitást. A portaLumi kezeli a termékadatokat és szerepköröket.

### roles
- id
- code

Kezdeti szerepek:
- user
- content_creator

### user_roles
- user_id
- role_id

Ugyanaz a személy lehet user és content_creator is.

## Creator és tartalom

### creator_profiles
- id UUID
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

## Felépített tartalmi sorozatok

A program nem random leckék halmaza.

Egy képző összeállíthat egy szakmailag felépített, sorrendben rögzített sorozatot. A user ennek belső sorrendjét nem cserélgeti.

### content_sequences
- id UUID
- creator_id
- title
- description
- period morning / evening
- status draft / published
- created_at
- updated_at

### content_sequence_items
- id UUID
- sequence_id
- course_unit_id nullable
- position
- title
- type
- duration_minutes nullable
- metadata JSON nullable

A position sorrend szakmai része a sorozatnak.

## Előre definiált programcsomagok

A creator teljes sorozatokból állít össze felhasználóknak választható programot.

Példa:
- reggeli sorozat
- esti sorozat

### program_templates
- id UUID
- creator_id nullable
- title
- subtitle
- description
- status draft / published
- created_at
- updated_at

### program_template_tracks
- id UUID
- program_template_id
- period morning / evening
- sequence_id

A program template nem tartalmaz week struktúrát.

## User program

Amikor a user kiválaszt egy kész programot, abból saját program-példány készül.

### user_programs
- id UUID
- user_id
- program_template_id nullable
- title
- status draft / active / completed
- start_date nullable
- end_date nullable
- current_position
- created_at
- updated_at

Nincs duration_weeks mező. Ha kell végdátum, end_date tárolható.

### user_program_tracks
- id UUID
- user_program_id
- period morning / evening
- sequence_id

A user a teljes reggeli vagy esti tracket lecserélheti egy másik teljes, felépített sorozatra.

Az egyes sorozatok belső sorrendjét nem változtatja.

### user_program_days
- id UUID
- user_program_id
- day_of_week

Értékek:
- monday
- tuesday
- wednesday
- thursday
- friday
- saturday
- sunday

A hétvége nincs automatikusan kizárva.

A user onboardingban kiválasztja:
"Mely napokon szeretnél foglalkozni a programmal?"

Nem kell külön megkérdezni, hány alkalom fér bele hetente. A kiválasztott napok ezt már kifejezik.

## Progress

A progress nem "program week" alapú.

### user_sequence_progress
- id UUID
- user_id
- user_program_id
- sequence_id
- sequence_item_id
- status pending / completed / skipped
- response_text nullable
- completed_at nullable

A UI a program pozícióit tetszőlegesen csoportosíthatja hetekbe vagy dátumokba, de ez prezentációs kérdés, nem a domain modell gerince.

## Reflexió és check-in

### reflections
- id UUID
- user_id
- user_program_id
- sequence_item_id nullable
- text
- created_at

### checkins
- id UUID
- user_id
- user_program_id
- period_key
- rating nullable
- difficulty nullable
- change_text nullable
- note nullable
- created_at

### affirmations
- id UUID
- user_id
- user_program_id nullable
- text
- accepted_at nullable
- audio_path nullable
- cadence nullable
- active
- created_at

## Média

Első körben:

storage/app/public/
- courses/{course-id}/units/{unit-id}/media/
- courses/{course-id}/units/{unit-id}/covers/
- users/{user-id}/affirmations/

Adatbázisba relatív path kerüljön, ne fix domain URL.

## Frontend repository réteg

A mostani repository absztrakciók maradnak.

- CourseRepository
- ProgramTemplateRepository
- UserRepository
- CreatorRepository

Demo:
- JSON implementációk

Valódi app:
- API implementációk

A UI-nak nem kell tudnia, hogy az adat JSON-ból vagy Laravelből érkezik.

## AI

Az első valódi verzióhoz nem szükséges AI.

Első stabil termék:
1. creator tartalom
2. authored sequence
3. creator program template
4. user program választás
5. teljes track csere
6. napválasztás
7. progress és feedback

AI később:
- program ajánlás
- következő ciklus javaslat
- személyre szabott megerősítés
- program finomhangolás

Az AI nem írhatja felül automatikusan a képző által rögzített szakmai sorrendet.
