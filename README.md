# SmartMeal

Aplikacija za planiranje obroka i pametnu kupovinu — pretraži namirnice, usporedi cijene u tri najveća lanca (Konzum, Lidl, Kaufland), sastavi obroke s automatskim izračunom kalorija, i generiraj listu za kupovinu s praćenjem ukupne cijene.

🔗 **Live demo:** [https://smartmeal.gabrieljanjic.com/)

> ⚠️ Backend je hostan na Azure free tieru koji se uspava nakon perioda neaktivnosti — prvi request nakon pauze (npr. login) može potrajati 10-20 sekundi dok se server probudi. Svaki sljedeći request je brz.

---

## Screenshots

![Home](docs/screenshots/landing_page.PNG)
![Meal planner](docs/screenshots/meals.PNG)
![Shopping cart](docs/screenshots/shopping_cart.PNG)

---

## Značajke

- 🔍 **Pretraga namirnica** preko integracije s [cijene.dev](https://cijene.dev) API-jem — svaka namirnica odmah prikazuje trenutnu cijenu u tri trgovačka lanca: Konzum, Lidl i Kaufland. Pretraga koristi debounce i prikazuje rezultate u dropdownu ispod inputa
- 🍽️ **Planiranje obroka** po danima — dodaj namirnice u obrok, mijenjaj količine, briši ili uređuj stavke
- 🔥 **Automatski izračun kalorija** za svaki obrok na temelju dodanih namirnica i količina
- 🛒 **Košarica za kupovinu** — prebaci stavke iz obroka direktno u košaricu, aplikacija automatski izračuna ukupnu cijenu kupovine
- ✅ **Praćenje kupovine** — označi stavke kao kupljene, uredi količine ili ih ukloni iz košarice
- 🔐 **Autentifikacija** korisnika putem JWT tokena spremljenog u HttpOnly cookieju
- 🛡️ **Administracija** — stranica dostupna samo korisnicima s ulogom `Admin`:
  - popis svih korisnika (ime, email, uloga, datum registracije)
  - postavljanje ili micanje admin uloge jednim klikom
  - brisanje korisnika uz potvrdu
  - zaštita da admin ne može promijeniti vlastitu ulogu niti obrisati samog sebe
  - responzivan prikaz: tablični raspored na desktopu, kartice na mobitelu
- 🔒 **Zaštita od dvostrukog klika** na akcijama dodavanja i administracije, dok traje zahtjev gumbi su onemogućeni

---

## Tech stack

**Frontend**
- React + TypeScript
- Vite
- Tailwind CSS
- TanStack React Query
- Axios
- React Router
- React Hot Toast
- React Icons
- Hostano na Azure Static Web Apps

**Backend**
- .NET (ASP.NET Core Web API)
- Entity Framework Core
- Microsoft SQL Server (Azure SQL Database)
- JWT autentifikacija (HttpOnly cookie) s role-based autorizacijom (`User` / `Admin`)
- Repository pattern (kontroler → `IUserRepository` → `UserRepository` → `DbContext`)
- Hostano na Azure App Service

**Vanjski servisi**
- [cijene.dev](https://cijene.dev) — dohvat cijena namirnica u realnom vremenu
- [Open Food Facts](https://world.openfoodfacts.org) — dohvat nutritivnih vrijednosti namirnica po EAN kodu (`https://world.openfoodfacts.org/api/v2/product/{eanCode}.json`), koristi se za automatski izračun kalorija u obrocima

---

## API dokumentacija

Bazni URL produkcijskog API-ja: `https://smartmeal-fgguguhdb9hre6ap.swedencentral-01.azurewebsites.net`

### Auth

| Metoda | Ruta | Opis |
|---|---|---|
| GET | `/api/Auth/me` | Dohvaća podatke o trenutno prijavljenom korisniku |
| POST | `/api/Auth/register` | Registracija novog korisnika |
| POST | `/api/Auth/login` | Prijava korisnika, postavlja JWT u HttpOnly cookie |
| POST | `/api/Auth/logout` | Odjava korisnika, briše auth cookie |

### Meal Items

| Metoda | Ruta | Opis |
|---|---|---|
| GET | `/api/meal-items` | Dohvaća sve stavke obroka za odabrani datum |
| POST | `/api/meal-items` | Dodaje novu namirnicu u obrok |
| PUT | `/api/meal-items/{id}` | Ažurira količinu stavke obroka |
| DELETE | `/api/meal-items/{id}` | Briše stavku iz obroka |

### Products

| Metoda | Ruta | Opis |
|---|---|---|
| GET | `/api/Products` | Pretraga namirnica |
| GET | `/api/Products/{eanCode}` | Dohvaća detalje namirnice po EAN kodu, uključujući cijene u sva tri lanca |

### Shopping Cart

| Metoda | Ruta | Opis |
|---|---|---|
| GET | `/api/shopping-cart` | Dohvaća sve stavke u košarici |
| POST | `/api/shopping-cart` | Dodaje novu stavku u košaricu |
| PUT | `/api/shopping-cart/{id}/amount` | Ažurira količinu stavke u košarici |
| PUT | `/api/shopping-cart/{id}/bought-at` | Označava stavku kao kupljenu |
| DELETE | `/api/shopping-cart/{id}` | Briše stavku iz košarice |

### User (samo za uloge `Admin`)

| Metoda | Ruta | Opis |
|---|---|---|
| GET | `/api/User` | Dohvaća popis svih korisnika (id, ime, email, uloga, datum registracije) |
| PUT | `/api/User/{id}/toggle-admin` | Mijenja ulogu korisnika između `User` i `Admin`. Vraća `400` ako admin pokuša promijeniti vlastitu ulogu |
| DELETE | `/api/User/{id}` | Briše korisnika. Vraća `400` ako admin pokuša obrisati samog sebe |

Svi endpointi u ovoj skupini zahtijevaju prijavu i ulogu `Admin`, a nepostojeći korisnik vraća `404`.

---

## Arhitektura i deployment

- **Frontend** — deployan preko GitHub Actions na Azure Static Web Apps, automatski build i deploy na svaki push na `main` granu
- **Backend** — .NET Web API hostan na Azure App Service (Linux, F1 Free tier), podijeljen na kontrolere (HTTP sloj) i repozitorije (pristup bazi) registrirane preko dependency injectiona
- **Baza** — Azure SQL Database (Free tier)
- CORS konfiguriran da dopušta zahtjeve isključivo s produkcijske frontend domene i localhosta za razvoj

---

## Licenca

Ovaj projekt je napravljen u edukativne/portfolio svrhe.
