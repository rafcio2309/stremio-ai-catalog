import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const API_KEY = process.env.POLLINATIONS_API_KEY;
const SITE_BASE_URL = (process.env.SITE_BASE_URL || "").replace(/\/+$/, "");
const TEXT_MODEL = process.env.POLLINATIONS_TEXT_MODEL || "openai";
const IMAGE_MODEL = process.env.POLLINATIONS_IMAGE_MODEL || "flux";

if (!API_KEY) {
  console.error("Brak POLLINATIONS_API_KEY. Ustaw go jako zmienną środowiskową; nie wpisuj go do plików projektu.");
  process.exit(1);
}
if (!SITE_BASE_URL.startsWith("https://")) {
  console.error("Ustaw SITE_BASE_URL na publiczny adres HTTPS GitHub Pages, np. https://login.github.io/repo");
  process.exit(1);
}

const contentPath = path.join(ROOT, "content", "ai-originals.json");
const items = JSON.parse(await fs.readFile(contentPath, "utf8"));

async function generateDescription(item) {
  const prompt = `Napisz po polsku krótki, oryginalny opis katalogowy dla fikcyjnej koncepcji filmu.
Tytuł: ${item.title}
Gatunek: ${item.genre}
Zarys: ${item.premise}
Zwróć wyłącznie JSON w formacie {"description":"2-4 zdania","genres":["gatunek1","gatunek2"]}.
Nie twierdź, że film już istnieje ani że jest dostępny do odtworzenia. Nie naśladuj konkretnej franczyzy ani żyjącego twórcy.`;

  const response = await fetch("https://gen.pollinations.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: TEXT_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    })
  });
  if (!response.ok) throw new Error(`Tekst API zwróciło ${response.status}: ${await response.text()}`);
  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) throw new Error(`Brak treści w odpowiedzi tekstowej dla: ${item.title}`);
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Nie udało się odczytać JSON opisu dla: ${item.title}`);
  return JSON.parse(match[0]);
}

async function generatePoster(item) {
  const prompt = `${item.posterPrompt}. Original artwork, no logos, no readable words, no copyrighted characters.`;
  const url = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=${encodeURIComponent(IMAGE_MODEL)}&width=600&height=900`;
  const response = await fetch(url, {
    headers: { "Authorization": `Bearer ${API_KEY}` }
  });
  if (!response.ok) throw new Error(`Obraz API zwróciło ${response.status} dla ${item.title}: ${await response.text()}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const ext = (response.headers.get("content-type") || "").includes("png") ? "png" : "jpg";
  const filename = `${item.id}.${ext}`;
  await fs.writeFile(path.join(ROOT, "posters", filename), bytes);
  return `${SITE_BASE_URL}/posters/${filename}`;
}

for (const item of items) {
  console.log(`Generuję opis: ${item.title}`);
  const generated = await generateDescription(item);
  console.log(`Generuję plakat: ${item.title}`);
  const posterUrl = await generatePoster(item);
  const meta = {
    meta: {
      id: item.id,
      type: "movie",
      name: item.title,
      poster: posterUrl,
      description: `${generated.description} Koncepcja AI — nie jest to potwierdzenie istnienia gotowego filmu.`,
      releaseInfo: "AI concept",
      genres: Array.isArray(generated.genres) ? generated.genres : item.genre.split(",").map(s => s.trim()),
      links: []
    }
  };
  await fs.writeFile(
    path.join(ROOT, "meta", "movie", `${item.id}.json`),
    JSON.stringify(meta, null, 2) + "\n",
    "utf8"
  );
  item.generatedPoster = posterUrl;
  item.generatedDescription = generated.description;
  item.generatedGenres = meta.meta.genres;
}

const metas = items.map(item => ({
  id: item.id,
  type: "movie",
  name: item.title,
  poster: item.generatedPoster,
  description: item.generatedDescription,
  releaseInfo: "AI concept",
  genres: item.generatedGenres
}));

// Uzupełnij też URL-e przykładowego plakatu legalnego filmu dla wybranego repozytorium.
const legalCatalogPath = path.join(ROOT, "catalog", "movie", "films.json");
const legalCatalog = JSON.parse(await fs.readFile(legalCatalogPath, "utf8"));
for (const meta of (legalCatalog.metas || [])) {
  if (meta.id === "big-buck-bunny-cc") meta.poster = `${SITE_BASE_URL}/posters/big-buck-bunny.svg`;
}
await fs.writeFile(legalCatalogPath, JSON.stringify(legalCatalog, null, 2) + "\n", "utf8");
const legalMetaPath = path.join(ROOT, "meta", "movie", "big-buck-bunny-cc.json");
const legalMeta = JSON.parse(await fs.readFile(legalMetaPath, "utf8"));
if (legalMeta.meta?.id === "big-buck-bunny-cc") legalMeta.meta.poster = `${SITE_BASE_URL}/posters/big-buck-bunny.svg`;
await fs.writeFile(legalMetaPath, JSON.stringify(legalMeta, null, 2) + "\n", "utf8");

await fs.writeFile(
  path.join(ROOT, "catalog", "movie", "ai-originals.json"),
  JSON.stringify({ metas }, null, 2) + "\n",
  "utf8"
);

console.log("Gotowe. Sprawdź wygenerowane treści i pliki przed publikacją.");
console.log("Nie publikuj klucza API. Generator nie zapisuje go w plikach.");
