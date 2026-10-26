
# Stremio AI Catalog — statyczny dodatek

Katalog dla Stremio na Android TV z sekcjami:
- **Legalne filmy** — przykładowy wpis z oficjalną stroną projektu Blender Open Movies.
- **Seriale** — pusty katalog do uzupełnienia pozycjami, do których masz prawa lub legalny dostęp.
- **AI Originals** — autorskie koncepcje filmów z opisami i plakatami generowanymi lokalnie przez Pollinations.ai.

## Ważne ograniczenia

1. To jest **statyczny dodatek katalogowo-metadany**. Nie zawiera własnego streamingu i nie udostępnia nielegalnych kopii filmów.
2. Wpis w katalogu nie gwarantuje odtwarzania. Do odtwarzania korzystaj z oficjalnych dodatków Stremio lub legalnych źródeł. Katalog może pokazywać link do oficjalnej strony filmu.
3. GitHub Pages nie uruchamia generatora AI. Generator uruchamiasz lokalnie na komputerze; do repozytorium publikujesz tylko gotowe pliki JSON i obrazy.
4. **Nigdy nie dodawaj klucza `sk_...` do JavaScriptu, JSON, HTML, historii Git ani publicznego repozytorium.** Skrypt czyta go wyłącznie ze zmiennej środowiskowej na Twoim komputerze.
5. Pollinations może naliczać koszt/zużycie Pollen. Sprawdź limity i uprawnienia klucza przed generowaniem.

## Struktura

```text
manifest.json
catalog/
  movie/films.json
  movie/ai-originals.json
  series/series.json
meta/
  movie/big-buck-bunny-cc.json
  movie/ai-original-moonlight-archive.json
  movie/ai-original-clockwork-garden.json
  movie/ai-original-last-tram-to-mars.json
posters/
  big-buck-bunny.svg
  ai-original-moonlight-archive.svg
  ai-original-clockwork-garden.svg
  ai-original-last-tram-to-mars.svg
content/ai-originals.json
tools/generate-content.mjs
.env.example
.gitignore
.nojekyll
```

## 1. Wymagania

- Konto GitHub i repozytorium publiczne (potrzebne dla prostego GitHub Pages).
- Node.js 20 lub nowszy na komputerze, na którym będziesz generować treści.
- Konto Pollinations.ai i klucz API z odpowiednimi uprawnieniami.

## 2. Generowanie opisów i plakatów AI

W katalogu projektu ustaw zmienne środowiskowe. **Nie zapisuj sekretnego klucza w pliku projektu.**

### Windows PowerShell

```powershell
$env:POLLINATIONS_API_KEY = "TU_WKLEJ_SWÓJ_KLUCZ_SK"
$env:SITE_BASE_URL = "https://TWOJ_LOGIN.github.io/TWOJE_REPO"
node tools/generate-content.mjs
```

### macOS / Linux

```bash
export POLLINATIONS_API_KEY="TU_WKLEJ_SWÓJ_KLUCZ_SK"
export SITE_BASE_URL="https://TWOJ_LOGIN.github.io/TWOJE_REPO"
node tools/generate-content.mjs
```

Możesz opcjonalnie ustawić model, zgodnie z aktualnym katalogiem modeli Pollinations:

```bash
POLLINATIONS_TEXT_MODEL=openai
POLLINATIONS_IMAGE_MODEL=flux
```

Skrypt:
- wysyła do Pollinations tylko tytuł, gatunek i prompt kreatywny;
- ustawia też właściwy adres plakatu demonstracyjnego Big Buck Bunny dla Twojego repozytorium;
- zapisuje wygenerowane plakaty w `posters/`;
- aktualizuje katalog `catalog/movie/ai-originals.json` i metadane `meta/movie/`;
- nie zapisuje klucza do plików.

Jeśli API/model jest niedostępny lub wymaga innego identyfikatora, sprawdź aktualne modele i limity w dokumentacji Pollinations.

## 3. Publikacja przez GitHub Pages

1. Utwórz repozytorium GitHub, np. `stremio-ai-catalog`.
2. Wgraj zawartość tego folderu do głównego katalogu repozytorium.
3. Otwórz **Settings → Pages**.
4. Wybierz publikację z gałęzi `main`, katalog `/ (root)`.
5. Po publikacji otwórz w przeglądarce:
   `https://TWOJ_LOGIN.github.io/TWOJE_REPO/manifest.json`
6. Sprawdź, czy manifest i przykładowe pliki JSON otwierają się poprawnie.
7. W Stremio otwórz stronę dodatku/instalacji i wklej adres manifestu lub otwórz go w przeglądarce urządzenia, które obsługuje instalowanie dodatków.

Adres manifestu będzie wyglądał tak:

```text
https://TWOJ_LOGIN.github.io/TWOJE_REPO/manifest.json
```

**Uwaga o CORS:** protokół dodatków Stremio może wymagać nagłówków CORS. GitHub Pages nie pozwala konfigurować własnych nagłówków odpowiedzi. Jeśli Stremio nie może pobrać manifestu lub katalogu mimo że pliki otwierają się w przeglądarce, przenieś te same statyczne pliki do hostingu statycznego z konfiguracją nagłówków, np. Cloudflare Pages, i ustaw `Access-Control-Allow-Origin: *`. To nadal nie wymaga własnego backendu.

## 4. Legalne źródła

- W projekcie jest przykładowy wpis **Big Buck Bunny** z linkiem do oficjalnej strony Blender Open Movies. Przed dystrybucją sprawdź aktualne warunki licencji oraz prawa do plików, muzyki i tłumaczeń.
- W katalogu `series` pozostawiono pustą listę — dodaj wyłącznie seriale z legalnego źródła lub takie, do których masz prawa.
- Nie kopiuj streamów z płatnych serwisów ani nie omijaj ich zabezpieczeń. Jeśli serwis ma oficjalny dodatek Stremio, zainstaluj go osobno.
- AI Originals to obecnie **koncepcje i metadane**. Plakat i opis nie oznaczają, że istnieje gotowy film do odtworzenia.

## 5. Aktualizacja

Po wygenerowaniu treści dodaj do repozytorium tylko pliki katalogów, metadanych i plakatów. Nie dodawaj `.env`, kluczy ani zrzutów ekranu zawierających dane konta.

## Dokumentacja

- Stremio Add-on Protocol: https://stremio.github.io/stremio-addon-sdk/protocol.html
- Pollinations API: https://gen.pollinations.ai/
- Pollinations Connect User Wallets (BYOP): https://enter.pollinations.ai/
- Blender Open Movies: https://studio.blender.org/films/
