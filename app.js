// app.js — versione migliorata con categorie, filtri, immagini grandi

const ASSOCIATE_TAG = "tuttowowshop-21";

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeProduct(p) {
  const asin = (p?.asin ?? "").toString().trim();
  const title = (p?.title ?? p?.titolo ?? "").toString().trim();
  const imageUrl = (p?.imageUrl ?? p?.["URL immagine"] ?? "").toString().trim();
  const categoria = (p?.categoria ?? "Altro").toString().trim();
  const bulletsRaw = p?.bullets ?? [];
  const bullets = Array.isArray(bulletsRaw)
    ? bulletsRaw.map(x => String(x)).filter(Boolean)
    : [];
  const amazonUrlRaw = (p?.amazonUrl ?? "").toString().trim();
  const amazonUrl = buildAmazonUrl(amazonUrlRaw, asin);
  return { asin, title, imageUrl, bullets, amazonUrl, categoria };
}

function buildAmazonUrl(raw, asin) {
  if (/^https?:\/\//i.test(raw)) return raw;
  if (asin && /^[A-Z0-9]{10}$/i.test(asin))
    return `https://www.amazon.it/dp/${encodeURIComponent(asin)}?tag=${encodeURIComponent(ASSOCIATE_TAG)}`;
  return "https://www.amazon.it/";
}

async function loadProducts() {
  const res = await fetch("/products.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Impossibile leggere /products.json (HTTP ${res.status})`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("products.json deve essere un array");
  return data.map(normalizeProduct);
}

function buildFiltri(products) {
  const wrap = document.getElementById("filtri");
  if (!wrap) return;

  // Raccogli categorie uniche
  const cats = [...new Set(products.map(p => p.categoria))].sort();

  cats.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "filtro";
    btn.dataset.cat = cat;
    btn.textContent = cat;
    wrap.appendChild(btn);
  });
}

function render(products, query, catAttiva) {
  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");
  const loading = document.getElementById("loading");
  const badge = document.getElementById("count-badge");

  if (!grid) return;
  if (loading) loading.classList.add("hidden");

  const q = (query || "").trim().toLowerCase();
  const cat = catAttiva || "tutti";

  let filtered = products;

  // Filtro categoria
  if (cat !== "tutti") {
    filtered = filtered.filter(p => p.categoria === cat);
  }

  // Filtro ricerca testo
  if (q) {
    filtered = filtered.filter(p => {
      const t = (p.title || "").toLowerCase();
      const a = (p.asin || "").toLowerCase();
      const b = Array.isArray(p.bullets) ? p.bullets.join(" ").toLowerCase() : "";
      return t.includes(q) || a.includes(q) || b.includes(q);
    });
  }

  // Badge contatore
  if (badge) {
    badge.textContent = `${filtered.length} prodotti`;
    badge.classList.remove("hidden");
  }

  grid.innerHTML = filtered.map(p => {
    const rawAsin = (p.asin || "").trim();
    const titleText = (p.title || "").trim();
    const title = escapeHtml(titleText || (rawAsin ? `Prodotto Amazon (${rawAsin})` : "Prodotto Amazon"));
    const asinSafe = escapeHtml(rawAsin);
    const bullets = Array.isArray(p.bullets) ? p.bullets.slice(0, 3) : [];
    const bulletsHtml = bullets.map(b => `<li>${escapeHtml(b)}</li>`).join("");

    const imgUrl = (p.imageUrl || "").trim();
    const imgHtml = imgUrl
      ? `<img class="card-img" src="${escapeHtml(imgUrl)}" alt="${title}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`
      : `<div class="card-img-placeholder">📦</div>`;

    const amazonUrl = (p.amazonUrl || "").trim();
    const hasValidAsin = /^[A-Z0-9]{10}$/i.test(rawAsin);
    const isFallbackHome = amazonUrl === "https://www.amazon.it/";
    const disableBtn = !hasValidAsin && isFallbackHome;

    const btnHtml = disableBtn
      ? `<span class="btn btn-disabled" aria-disabled="true">Link non disponibile</span>`
      : `<a class="btn" href="${escapeHtml(amazonUrl)}" target="_blank" rel="sponsored noopener">Vedi su Amazon →</a>`;

    return `
      <article class="card">
        <div class="card-img-wrap">${imgHtml}</div>
        <div class="card-body">
          <div class="card-cat">${escapeHtml(p.categoria || "Altro")}</div>
          <h3>${title}</h3>
          <ul>${bulletsHtml}</ul>
          ${btnHtml}
          <div class="meta">ASIN: ${asinSafe || "—"}</div>
        </div>
      </article>
    `;
  }).join("");

  if (empty) empty.classList.toggle("hidden", filtered.length !== 0);
}

async function main() {
  const input = document.getElementById("q");
  const loading = document.getElementById("loading");

  let catAttiva = "tutti";

  try {
    if (loading) loading.classList.remove("hidden");
    const products = await loadProducts();

    buildFiltri(products);
    render(products, "", catAttiva);

    // Ricerca testo
    if (input) {
      input.addEventListener("input", () => render(products, input.value, catAttiva));
    }

    // Filtri categoria
    const filtriWrap = document.getElementById("filtri");
    if (filtriWrap) {
      filtriWrap.addEventListener("click", e => {
        const btn = e.target.closest(".filtro");
        if (!btn) return;
        catAttiva = btn.dataset.cat;
        filtriWrap.querySelectorAll(".filtro").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        render(products, input ? input.value : "", catAttiva);
      });
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
