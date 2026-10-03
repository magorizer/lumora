# portaLumi kurzus sorrend és kurzusegyesítés

Dátum: 2026-10-03

## Kurzus sorrend

Minden kurzusnak van egy explicit felépítési típusa.

### Kötelező sorrend

requiresSequentialOrder = true

Jelentése:
- a leckék egymásra épülnek
- a felhasználó a creator által meghatározott sorrendet követi
- a programgenerátor sem keverheti össze önkényesen a kurzus belső sorrendjét

### Moduláris

requiresSequentialOrder = false

Jelentése:
- a leckék önálló modulok
- a kurzusoldalon "Moduláris" jelzés jelenik meg
- később a programgenerátor különálló modulokat is kiválaszthat belőle

Az editorban a beállítás két rádiógomb:

"Kötelező időrendi sorrendben hallgatás"

- Igen
- Nem

## Későbbi ötlet: két kurzus egyesítése

Ez most csak backlog ötlet, nincs implementálva.

Cél:
a creator két meglévő kurzusból létrehozhasson egy harmadik, kombinált kurzust.

Javasolt működés:
1. két kurzus kiválasztása
2. új kombinált kurzus létrehozása
3. eredeti kurzusok változatlanul megmaradnak
4. leckék közös listában jelennek meg
5. creator rendezi / kiválasztja a megtartandó elemeket
6. új metaadatok megadása
7. új kurzus felépítésének megadása:
   - kötelező sorrend
   - moduláris

Fontos:
- ne automatikusan írjuk felül egyik eredeti kurzust sem
- duplikált leckéket külön jelezni kell
- a funkciót a valódi DB-s kurzusmodell után érdemes elkészíteni
