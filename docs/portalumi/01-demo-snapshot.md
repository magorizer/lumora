# portaLumi demo snapshot

Dátum: 2026-10-03

Ez a dokumentum rögzíti a portaLumi korábbi demo állapotát és azokat a termékdöntéseket, amelyeket a valódi implementáció során meg szeretnénk tartani.

## Aktuális modellre vonatkozó megjegyzés

A programmodell és a user navigáció azóta tovább lett pontosítva. A jelenlegi irányt a következő dokumentumok írják le:

- 02-v1-architecture.md
- 04-program-templates.md
- 05-home-navigation.md

A régi, kötelező program_week alapú modellt ne tekintsük aktuális implementációs alapnak.

## Termékirány

A portaLumi személyre szabott fejlődési útvonalakat állít össze képzők által feltöltött tartalmakból.

A felhasználó:
- megadja, miben szeretne fejlődni
- kitölti a rövid adaptív kérdőívet
- kap egy 8–12 hetes programot
- napi / heti feladatokat végez
- időszakosan visszajelzést ad
- a rendszer a következő ciklust az előző tapasztalatok alapján módosítja

A képző / content creator:
- kurzusokat hoz létre
- kurzuson belül leckéket, gyakorlatokat, hanganyagokat, meditációkat kezel
- metaadatokat ad meg, amelyekből később az ajánlórendszer dolgozik
- egyes tartalmaknál médiafájlt tölthet fel vagy URL-t adhat meg

## Szerepek

Jelenleg két szerepkörrel számolunk:

- user
- content_creator

Ugyanaz a felhasználó mindkét szereppel rendelkezhet, és a két mód között válthat.

Később külön rendszeradmin szerep is bevezethető, de ez nem része az első valódi verziónak.

## Felhasználói flow

A demo onboarding jelenlegi logikája:

1. cél megadása
2. jelenlegi helyzet és akadályok
3. idő, formátum és tempó preferenciák
4. profil összefoglaló
5. program generálása

Ez külön onboarding progress bar.

A program ezután külön életciklus:

- program áttekintés
- program finomhangolása
- aktuális hét
- mai feladatok
- lecke / gyakorlat
- opcionális check-in
- időszakos review
- következő ciklus

A program progress bar nem a demo oldalainak számát mutatja, hanem a program állapotát, például: 3. hét / 12.

## Program nézet

A program áttekintőben:

- látszik a teljes 12 hét
- minden hét kattintható
- a hét tartalma slide-up / bottom sheet előnézetben jelenik meg
- az előnézetből a tartalom még nem indítható el
- a részleteknél megjelenik a napszak:
  - Reggeli gyakorlat
  - Napközbeni feladat
  - Esti gyakorlat

Az aktuális hét oldalon:

- a fő blokk neve: Mai feladatok
- a demo jelenleg 3 aktuális feladatot mutat
- mindegyik kattintható
- a videó / hang / gyakorlat a megfelelő lesson oldalra visz
- a feedback külön check-in oldalra visz

## Lecke és visszajelzés

A lecke tartalmazhat:

- videót
- hanganyagot
- gyakorlatot
- meditációt

A leckén belül lehet:

- saját válasz textarea
- opcionális rövid reflexió
- teljesítés jelölése

A részletes feedback nem minden lecke után kötelező. Inkább időszakos checkpoint:

- 2 hetente
- havonta
- vagy kikapcsolva

## Személyes megerősítés

A review során a rendszer később személyre szabott megerősítést javasolhat.

Jelenlegi elképzelés:

- AI generál egy rövid mondatot a felhasználó előrehaladása alapján
- a felhasználó elfogadja vagy módosítja
- később saját hangon is felveheti
- a rendszer ismétlődően megjelenítheti / lejátszhatja

Például:

- minden reggel
- minden második reggel
- hetente

## Content creator felület

A creator felület fő részei:

- dashboard
- Kurzusaim
- Új kurzus
- Képzői profil

A Kurzusaim külön oldal.

Minden kurzus:
- külön színt kap
- kattintható
- külön kurzus-oldalon nyílik meg

A kurzus oldalon:
- kurzus alapadatai
- ajánlási metaadatok
- leckék és gyakorlatok
- egyenként szerkeszthető tartalmak

A kurzus maga is szerkeszthető.

Kurzus mezők:
- cím
- kategória
- leírás
- témák
- szint
- teljes időtartam
- ajánlott napszak
- formátum
- ajánlási metaadatok
- engagement beállítások

Lecke / tartalom mezők:
- cím
- típus
- időtartam
- rövid leírás
- média forrás
- borítókép

Média forrás:
- feltöltés
- URL

Borítókép:
- feltöltés
- URL

## Ajánlási metaadatok

A későbbi ajánlórendszer számára fontos metaadatok:

- témák
- célok
- problémák
- szint
- formátum
- időtartam
- ajánlott napszak
- előfeltételek
- lecke utáni reflexió szükségessége
- checkpoint gyakorisága
- megerősítés támogatása

## Jelenlegi technikai szerkezet

Frontend:

- Ionic
- Angular
- Capacitor

Backend alap:

- Laravel
- PHP
- MySQL / MariaDB tervezett

A demo jelenleg JSON repository-kból olvas.

A frontend repository absztrakciókat használ, ezért a cél az, hogy a JSON implementációkat fokozatosan API repository-kra cseréljük anélkül, hogy a UI-t újra kellene írni.

Jelenlegi fontos repository-k:

- CourseRepository
- ProgramRepository
- UserRepository
- CreatorRepository

## UI és CSS döntések

A cél egy egyszerű, közös design rendszer.

Alapelv:

- h1–h6 globálisan definiálva
- közös card / button / form classok
- mixinek és utility classok használata
- page-specifikus SCSS csak akkor, ha tényleg szükséges
- ne legyen ugyanaz a komponens több oldalon újradefiniálva
- a global.scss maradjon kicsi
- a közös vizuális elemek a theme utility rétegben legyenek

A portaLumi logo mindenhol valódi képfájlként jelenik meg, nem CSS-ből újrarajzolva.
