# portaLumi kurzus- és csomagszerkesztő v2

Dátum: 2026-10-05

## Kurzus

A kurzus szintje választható, és a `nincs` érték is engedélyezett.

A kurzus teljes időtartama nem külön szerkeszthető mező. A rendszer a kurzus tartalmi elemeinek időtartamából számolja ki.

### Sorrend

A hosszú igen/nem választás helyett egyszerű switch toggle van:

- bekapcsolva: kötelező időrendi sorrend, a leckék egymásra épülnek
- kikapcsolva: moduláris kurzus

### Ajánlott napszak

Előre definiált opciók, többek között:

- nincs
- közvetlenül ébredés után
- ébredés után 15–30 perccel
- reggel
- délelőtt
- ebéd körül
- napközben
- délután
- kora este
- este
- közvetlenül lefekvés előtt
- bármikor
- szükség szerint

### Formátumok

Többválasztós dropdown / lenyíló szerkesztő. A lista a gyakori LMS és creator tartalomtípusokat is lefedi:

- videó
- hanganyag
- podcast
- szöveg / cikk
- kép / galéria
- PDF / munkafüzet
- meditáció
- vezetett gyakorlat
- feladat
- kvíz
- kérdőív / survey
- vizsga / teszt
- prezentáció
- élő / webinar
- beszélgetés / közösségi
- külső tartalom / beágyazás
- interaktív / multimédia
- interaktív szcenárió
- mini-tananyag / tutorial
- letölthető anyag

## Tartalom

Minden kurzuselemnél külön switch:

`Egyénileg is hallgatható`

Ez arra szolgál, hogy például egy meditáció vagy hanganyag a teljes kurzustól függetlenül is ajánlható és használható legyen.

## Csomagok

A csomag nem kötött reggel + este struktúrához.

Lehetséges például:

- csak reggeli csomag
- csak esti csomag
- napi három külön blokk
- tetszőleges időpontokkal összeállított több kurzusos csomag

Minden creator/editor létrehozhat új csomagot az összes már feltöltött kurzusból.

A csomagszerkesztőben:

- új kurzusblokk hozzáadható
- bármely feltöltött kurzus kiválasztható
- időpont választható blokkonként
- blokkok átrendezhetők
- blokkok törölhetők

A kurzus belső kötelező sorrendje ettől nem változik.

## Logo

A választott alkalmazáslogo a jobbra néző, alul finoman megszakított arany L-es változat, a ponttal az arany portál-A belsejében. PNG-ként kerül az alkalmazásba.
