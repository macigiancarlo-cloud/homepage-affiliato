// app.js (robusto: accetta products.json con chiavi inglesi o italiane)

const ASSOCIATE_TAG = "tuttowowshop-21"; // <-- il tuo tag affiliato

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Normalizza un prodotto: supporta sia chiavi "inglesi" che "italiane"
function normalizeProduct(p) {
  const asin = (p?.asin ?? p?.["asinò"] ?? p?.["asin"] ?? "").toString().trim();

  const title = (p?.title ?? p?.titolo ?? p?.["titolo"] ?? "").toString().trim();

  const imageUrl = (
    p?.imageUrl ??
    p?.["URL immagine"] ??
    p?.["url immagine"] ??
    p?.["URL_immagine"] ??
    ""
  ).toString().trim();

  const bulletsRaw = p?.bullets ?? p?.proiettili ?? p?.["proiettili"] ?? [];
  const bullets = Array.isArray(bulletsRaw)
    ? bulletsRaw.map((x) => String(x)).filter(Boolean)
    : [];

  const amazonUrlRaw = (p?.amazonUrl ?? p?.["amazonUrl"] ?? "").toString().trim();
  const amazonUrl = buildAmazonUrl(amazonUrlRaw, asin);

  return { asin, title, imageUrl, bullets, amazonUrl };
}

// Costruisce un URL Amazon valido.
// Priorità:
// 1) se amazonUrlRaw è già un http(s) URL -> usa quello
// 2) altrimenti se c'è ASIN -> costruisci https://www.amazon.it/dp/<ASIN>?tag=<TAG>
// 3) fallback -> Amazon homepage
function buildAmazonUrl(amazonUrlRaw, asin) {
  const raw = (amazonUrlRaw || "").trim();

  // già URL completo
  if (/^https?:\/\//i.test(raw)) return raw;

  // se qualcuno ha messo solo "tag=..." o roba simile, ignoralo e costruisci da ASIN
  if (asin && /^[A-Z0-9]{10}$/i.test(asin)) {
    return `https://www.amazon.it/dp/${encodeURIComponent(asin)}?tag=${encodeURIComponent(
      ASSOCIATE_TAG
    )}`;
  }

  return "https://www.amazon.it/";
}

async function loadProducts() {
  const res = await fetch("/products.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Impossibile leggere /products.json (HTTP ${res.status})`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("products.json deve essere un array");
  return data.map(normalizeProduct);
}

function render(products, query = "") {
  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");
  const loading = document.getElementById("loading");

  if (!grid) return;
  if (loading) loading.classList.add("hidden");

  const q = query.trim().toLowerCase();

  const filtered = q
    ? products.filter((p) => {
        const title = (p.title || "").toLowerCase();
        const asin = (p.asin || "").toLowerCase();
        const bullets = Array.isArray(p.bullets) ? p.bullets.join(" ").toLowerCase() : "";
        return title.includes(q) || asin.includes(q) || bullets.includes(q);
      })
    : products;

  grid.innerHTML = filtered
    .map((p) => {
      const rawAsin = (p.asin || "").trim();

      const titleText = (p.title || "").trim();
      const title = escapeHtml(
        titleText || (rawAsin ? `Prodotto Amazon (ASIN ${rawAsin})` : "Prodotto Amazon")
      );

      const asinSafe = escapeHtml(rawAsin);

      // bullets (max 3)
      const bullets = Array.isArray(p.bullets) ? p.bullets.slice(0, 3) : [];
      const bulletsHtml = bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("");

      // immagine
      const imgUrl = (p.imageUrl || "").trim();
      const imgTag = imgUrl
        ? `<img class="card-img" src="${escapeHtml(imgUrl)}" alt="${title}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`
        : `<div class="card-img" aria-hidden="true"></div>`;

      // link Amazon: se asin non valido e amazonUrl è fallback, disabilita bottone
      const amazonUrl = (p.amazonUrl || "").trim();
      const hasValidAsin = /^[A-Z0-9]{10}$/i.test(rawAsin);
      const isFallbackHome = amazonUrl === "https://www.amazon.it/";
      const disableBtn = !hasValidAsin && isFallbackHome;

      const btnHtml = disableBtn
        ? `<span class="btn btn-disabled" aria-disabled="true" title="ASIN mancante o non valido">Link non disponibile</span>`
        : `<a class="btn" href="${escapeHtml(amazonUrl)}" target="_blank" rel="sponsored noopener">
             Vedi su Amazon
           </a>`;

      return `
        <article class="card">
          <div class="card-head">
            ${imgTag}
            <h3>${title}</h3>
          </div>

          <ul>${bulletsHtml}</ul>

          ${btnHtml}

          <div class="meta">ASIN: ${asinSafe || "-"}</div>
        </article>
      `;
    })
    .join("");

  if (empty) empty.classList.toggle("hidden", filtered.length !== 0);
}

async function main() {
  const input = document.getElementById("q");
  const loading = document.getElementById("loading");

  try {
    if (loading) loading.classList.remove("hidden");
    const products = await loadProducts();
    render(products, "");
    if (input) input.addEventListener("input", () => render(products, input.value));
  } catch (err) {
    console.error(err);
    const empty = document.getElementById("empty");
    if (loading) loading.classList.add("hidden");
    if (empty) {
      empty.classList.remove("hidden");
      empty.innerHTML = `<strong>Errore caricamento prodotti</strong><br>${escapeHtml(
        err?.message || String(err)
      )}`;
    }
  }
}

main();
