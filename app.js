const AFF_TAG = "tuttowowshop-21";

function amazonLink(asin) {
  return `https://www.amazon.it/dp/${encodeURIComponent(asin)}?tag=${encodeURIComponent(AFF_TAG)}`;
}

// Immagine prodotto basata su ASIN (widget Amazon Ads).
// Non richiede PA-API e funziona bene su siti statici.
function amazonImage(asin) {
  const a = encodeURIComponent(asin);
  const tag = encodeURIComponent(AFF_TAG);
  return `https://ws-eu.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${a}&Format=_SL160_&ID=AsinImage&MarketPlace=IT&ServiceVersion=20070822&WS=1&tag=${tag}`;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadProducts() {
  // IMPORTANTISSIMO: path assoluto per Vercel + no cache
  const res = await fetch("/products.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Impossibile leggere /products.json (HTTP ${res.status})`);

  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("products.json deve essere un array");
  return data;
}

function render(products, query = "") {
  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");

  if (!grid) throw new Error('Manca <div id="grid"> in index.html');
  if (!empty) throw new Error('Manca <div id="empty"> in index.html');

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
      const title = escapeHtml(p.title || "Prodotto");
      const asinSafe = escapeHtml(rawAsin);

      const bullets = Array.isArray(p.bullets) ? p.bullets.slice(0, 3) : [];
      const bulletsHtml = bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("");

      return `
        <article class="card">
          <div class="card-head">
            <img
              class="card-img"
              src="${amazonImage(rawAsin)}"
              alt="${title}"
              loading="lazy"
              decoding="async"
            />
            <h3>${title}</h3>
          </div>

          <ul>${bulletsHtml}</ul>

          <a class="btn" href="${amazonLink(rawAsin)}" target="_blank" rel="sponsored noopener">
            Vedi su Amazon
          </a>

          <div class="meta">ASIN: ${asinSafe}</div>
        </article>
      `;
    })
    .join("");

  // Usa la classe che ESISTE nel tuo CSS: .hidden
  empty.classList.toggle("hidden", filtered.length !== 0);
}

async function main() {
  const loading = document.getElementById("loading");
  const empty = document.getElementById("empty");
  const input = document.getElementById("q");

  try {
    if (loading) loading.classList.remove("hidden");

    const products = await loadProducts();

    if (loading) loading.classList.add("hidden");

    render(products, "");

    if (input) {
      input.addEventListener("input", () => render(products, input.value));
    }
  } catch (err) {
    console.error(err);

    if (loading) loading.classList.add("hidden");

    // Mostra errore in pagina (così lo vedi anche senza Console)
    if (empty) {
      empty.classList.remove("hidden");
      empty.innerHTML = `
        <strong>Errore caricamento prodotti</strong><br>
        ${escapeHtml(err.message || String(err))}
      `;
    }
  }
}

main();