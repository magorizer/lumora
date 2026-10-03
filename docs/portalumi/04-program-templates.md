# portaLumi program templates és scheduling döntések

Dátum: 2026-10-03

## Mi változott

A program fő domain objektuma nem program_week.

A szakmai tartalom sorrendje külön authored sequence-ben él.

A programcsomag teljes authored sequence-eket kapcsol össze.

A user kiválaszthatja, mely napokon szeretne foglalkozni a programmal, beleértve a hétvégét is.

## User napválasztás

Kérdés:

"Mely napokon szeretnél foglalkozni a programmal?"

Választható:
- Hétfő
- Kedd
- Szerda
- Csütörtök
- Péntek
- Szombat
- Vasárnap

Nem kérdezzük külön, hány alkalom fér bele hetente.

## Customizálás

A user nem rendezheti át egy képző 12 alkalmas szakmai sorozatának belső sorrendjét.

Megengedett:
- teljes reggeli program cseréje másik reggeli programra
- teljes esti program cseréje másik esti programra
- saját napok kiválasztása

Nem megengedett:
- 1., 7., 3., 5. alkalom tetszőleges összekeverése

## Demo programok

### 1. Energikusabb mindennapok

Reggel:
- Reggeli energizáló breathwork
- Barta Márk
- 12 alkalom

Este:
- Esti Joe Dispenza meditációs sorozat
- 12 alkalom

### 2. Magabiztosság

Reggel:
- meditáció + pozitív megerősítések
- 5–10 perc
- 12 alkalom

Este:
- NLP önbizalom-program
- 5–10 perc
- 12 alkalom

### 3. Megnyugvás / lelki béke

Reggel:
- 10–20 perces meditáció
- 12 alkalom

Este:
- másik előadó meditációs sorozata
- 12 alkalom

## Demo JSON

src/assets/demo/program-templates.json

A JSON tartalmazza:
- 6 authored sequence-et
- sequence-enként 12 alkalmat
- 3 előre definiált programcsomagot

## Creator oldal

Új menüpont:

Programok

A creator:
- létrehozhat programcsomagot
- szerkesztheti a címet és leírást
- kiválaszthatja a teljes reggeli sequence-et
- kiválaszthatja a teljes esti sequence-et
- előnézetben látja a 12 + 12 alkalmat

A sequence belső szerkesztése későbbi külön editor feladat.
