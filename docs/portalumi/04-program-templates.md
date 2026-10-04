# portaLumi csomagok és scheduling döntések

Dátum: 2026-10-04

## Csomag

A csomag felhasználói összeállítás több meglévő kurzusból.

Nem fix reggel + este szerkezet.

Egy csomagban tetszőleges számú napi blokk lehet.

Példák:
- csak reggel
- csak este
- reggel + este
- napi 3 blokk
- később más ritmusok is

Minden blokk:
- egy teljes kurzusra hivatkozik
- kap egy időpont / napszak címkét
- sorrendben szerepel a csomagon belül

## Demo csomagok

### 1. Energikusabb mindennapok
- csak reggel
- Reggeli 5 perces indító fókusz
- közvetlenül ébredés után

### 2. Magabiztosság
- csak este
- Önbizalom gyakorlatban
- este

### 3. Megnyugvás / lelki béke
- napi 3 blokk
- reggel: Reggeli 5 perces indító fókusz
- délután: Stressz Reset
- közvetlenül lefekvés előtt: NLP esti lecsendesedés

## Creator csomag editor

Minden content creator:
- létrehozhat új csomagot
- az összes már feltöltött kurzusból választhat
- több kurzust is hozzáadhat
- ugyanazt a kurzust több blokkban is használhatja
- megadhatja minden blokk időpontját
- átrendezheti a blokkokat
- törölhet blokkot

A kurzus tulajdonosa és a csomag összeállítója nem feltétlenül ugyanaz.

## Kurzus sorrend

Kurzus szinten:
- Kötelező időrendi sorrend = bekapcsolva
- Moduláris = kikapcsolva

A csomag nem írhatja felül a kötött sorrendet.

## Egyénileg is hallgatható tartalom

Egy course_unit külön jelölhető:

standaloneAllowed = true

Ez azt jelenti, hogy például egy meditáció vagy rövid gyakorlat a teljes kurzustól függetlenül is ajánlható / használható.

Ez külön fogalom a moduláris kurzustól:
- moduláris kurzus: a kurzus leckéi nem kötelező sorrendűek
- standalone tartalom: konkrét lecke külön is kiemelhető

## User customizálás

A user:
- kiválasztja a napokat
- a csomag egy teljes kurzusát másik teljes kurzusra cserélheti

Nem rendezi át automatikusan egy kötött kurzus leckéit.
