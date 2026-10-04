# portaLumi napi visszajelzés és szerkesztési szabályok

Dátum: 2026-10-03

## Napi visszajelzés

A rövid reflexió nem a lecke oldal része.

Flow:

Mai program
→ reggeli / esti tartalmak
→ Napi program befejezése
→ Napi visszajelzés
→ következő programlépés

Minden befejezett programnap után van visszajelzés.

A napi feedback tartalmaz:
- hasznosság 1–5
- nehézség
- érzékelt változás
- rövid reflexió

A feedback mentése után a demo currentPosition értéke eggyel nő.

A 12. programlépés után a review következik.

## Navigáció

A portaLumi logó minden felületen a /home oldalra vezet.

A /home kivételével a felületeken látható egy "Főmenü" visszalépési lehetőség.

Ez a creator és profile nézetek felső sávjában is megjelenik.

## Kurzus szerkesztés

A kurzus fejlécében a szöveges "Kurzus szerkesztése" gomb helyett ceruza ikon jelenik meg.

A szerkesztőben módosítható:
- cím
- kategória
- leírás
- szint, beleértve a "nincs" opciót
- ajánlott napszak
- témák
- formátumok

Az időtartam nem külön szerkeszthető kurzusmező. A rendszer automatikusan a leckék / gyakorlatok időtartamából számolja.

Ajánlási metaadatok:
- célok
- problémák
- ajánlott időpontok
- előfeltételek

A napi feedback jelenleg termékszintű szabály, ezért nem creator által állítható cadence.


## Kurzus felépítése

Minden kurzusnál külön beállítás:

A "Kötelező időrendi sorrend" beállítás egy egyszerű switch toggle.

- bekapcsolva: a leckék egymásra épülnek
- kikapcsolva: Moduláris

Ha Igen:
- a leckék egymásra épülnek
- a usernek a kurzus sorrendjét kell követnie
- a felület "Kötelező sorrend" / "Időrendi sorrend" jelzést mutat

Ha Nem:
- a kurzus "Moduláris"
- a leckék önállóan is használhatók
- a későbbi recommendation engine egyes modulokat is könnyebben választhat belőle

Technikai mező:

requiresSequentialOrder: boolean


## Ajánlott napszak opciók

- nincs
- közvetlenül ébredés után
- reggel
- délelőtt
- napközben
- délután
- este
- közvetlenül lefekvés előtt
- bármikor

A bestTime mező kiválasztása egyben a recommendation preferredTimes értékét is frissíti, így nincs két külön, egymással versengő beállítás.

## Formátumok

A formátumok nem szabad szöveges mezőként jelennek meg, hanem többválasztós opcióként:

- videó
- hanganyag
- meditáció
- gyakorlat
