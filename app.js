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
  const categoria = (p?.categoria ?? p?.["categoria"] ?? "").toString().trim();
  const bulletsRaw = p?.bullets ?? p?.proiettili ?? p?.["proiettili"] ?? [];
  const bullets = Array.isArray(bulletsRaw)
    ? bulletsRaw.map((x) => String(x)).filter(Boolean)
    : [];
  const amazonUrlRaw = (p?.amazonUrl ?? p?.["amazonUrl"] ?? "").toString().trim();
  const amazonUrl = buildAmazonUrl(amazonUrlRaw, asin);
  return { asin, title, imageUrl, categoria, bullets, amazonUrl };
}

function buildAmazonUrl(amazonUrlRaw, asin) {
  const raw = (amazonUrlRaw || "").trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  if (asin && /^[A-Z0-9]{10}$/i.test(asin)) {
    return `https://www.amazon.it/dp/${encodeURIComponent(asin)}?tag=${encodeURIComponent(ASSOCIATE_TAG)}`;
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

function renderFilters(products, activeCategory, onSelect) {
  const container = document.getElementById("filtri");
  if (!container) return;

  // Raccoglie categorie uniche ordinate
  const cats = ["Tutti", ...Array.from(
    new Set(products.map(p => p.categoria).filter(Boolean))
  ).sort()];

  container.innerHTML = cats.map(cat => {
    const active = cat === activeCategory ? " filtro-attivo" : "";
    return `<button class="filtro${active}" data-cat="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`;
  }).join("");

  // Event listener sui bottoni
  container.querySelectorAll(".filtro").forEach(btn => {
    btn.addEventListener("click", () => onSelect(btn.dataset.cat));
  });
}

function render(products, query = "", activeCategory = "Tutti") {
  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");
  const loading = document.getElementById("loading");

  if (!grid) return;
  if (loading) loading.classList.add("hidden");

  const q = query.trim().toLowerCase();

  let filtered = activeCategory && activeCategory !== "Tutti"
    ? products.filter(p => p.categoria === activeCategory)
    : products;

  if (q) {
    filtered = filtered.filter((p) => {
      const title = (p.title || "").toLowerCase();
      const asin = (p.asin || "").toLowerCase();
      const cat = (p.categoria || "").toLowerCase();
      const bullets = Array.isArray(p.bullets) ? p.bullets.join(" ").toLowerCase() : "";
      return title.includes(q) || asin.includes(q) || cat.includes(q) || bullets.includes(q);
    });
  }

  grid.innerHTML = filtered
    .map((p) => {
      const rawAsin = (p.asin || "").trim();
      const titleText = (p.title || "").trim();
      const title = escapeHtml(
        titleText || (rawAsin ? `Prodotto Amazon (ASIN ${rawAsin})` : "Prodotto Amazon")
      );
      const asinSafe = escapeHtml(rawAsin);
      const categoria = escapeHtml((p.categoria || "").trim());

      const bullets = Array.isArray(p.bullets) ? p.bullets.slice(0, 3) : [];
      const bulletsHtml = bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("");

      const imgUrl = (p.imageUrl || "").trim();
      const imgHtml = imgUrl
        ? `<img src="${escapeHtml(imgUrl)}" alt="${title}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`
        : "";

      const amazonUrl = (p.amazonUrl || "").trim();
      const hasValidAsin = /^[A-Z0-9]{10}$/i.test(rawAsin);
      const isFallbackHome = amazonUrl === "https://www.amazon.it/";
      const disableBtn = !hasValidAsin && isFallbackHome;
      const btnHtml = disableBtn
        ? `<span class="btn btn-disabled" aria-disabled="true">Link non disponibile</span>`
        : `<a class="btn" href="${escapeHtml(amazonUrl)}" target="_blank" rel="sponsored noopener">Vedi su Amazon</a>`;

      const catHtml = categoria
        ? `<span class="card-cat">${categoria}</span>`
        : "";

      return `
        <article class="card">
          <div class="card-img-wrap">${imgHtml}</div>
          <div class="card-body">
            ${catHtml}
            <h3>${title}</h3>
            <ul>${bulletsHtml}</ul>
            ${btnHtml}
            <div class="meta">ASIN: ${asinSafe || "-"}</div>
          </div>
        </article>
      `;
    })
    .join("");

  if (empty) empty.classList.toggle("hidden", filtered.length !== 0);
}

async function main() {
  const input = document.getElementById("q");
  const loading = document.getElementById("loading");
  let activeCategory = "Tutti";

  try {
    if (loading) loading.classList.remove("hidden");
    const products = await loadProducts();

    const onCategorySelect = (cat) => {
      activeCategory = cat;
      renderFilters(products, activeCategory, onCategorySelect);
      render(products, input ? input.value : "", activeCategory);
    };

    renderFilters(products, activeCategory, onCategorySelect);
    render(products, "", activeCategory);

    if (input) {
      input.addEventListener("input", () => render(products, input.value, activeCategory));
    }
  } catch (err) {
    console.error(err);
    const empty = document.getElementById("empty");
    if (loading) loading.classList.add("hidden");
    if (empty) {
      empty.classList.remove("hidden");
      empty.innerHTML = `<strong>Errore caricamento prodotti</strong><br>${escapeHtml(err?.message || String(err))}`;
    }
  }
}

main();
