// app.js
const AFF_TAG = "tuttowowshop-21";

function amazonLink(asin) {
  return `https://www.amazon.it/dp/${encodeURIComponent(asin)}?tag=${encodeURIComponent(AFF_TAG)}`;
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
  // IMPORTANTE: path assoluto per funzionare su Vercel, dominio custom e preview
  const res = await fetch("/products.json", { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Impossibile leggere /products.json (HTTP ${res.status})`);
  }

  const data = await res.json();

  if (!Array.isArray(data)) {
    throw new Error("products.json deve essere un array");
  }

  return data;
}

function normalizeProducts(data) {
  return data.map((p) => ({
    asin: (p && p.asin ? String(p.asin) : "").trim(),
    title: (p && p.title ? String(p.title) : "Prodotto").trim(),
    bullets: Array.isArray(p && p.bullets) ? p.bullets.map((b) => String(b)) : [],
  })).filter((p) => p.asin.length > 0);
}

function render(products, query = "") {
  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");
  const loading = document.getElementById("loading");

  if (!grid) return;

  // Nasconde il banner "Caricamento..." appena stiamo per renderizzare
  if (loading) loading.style.display = "none";

  const q = query.trim().toLowerCase();

  const filtered = q
    ? products.filter((p) => {
        const t = (p.title || "").toLowerCase();
        const a = (p.asin || "").toLowerCase();
        const b = (p.bullets || []).join(" ").toLowerCase();
        return t.includes(q) || a.includes(q) || b.includes(q);
      })
    : products;

  grid.innerHTML = filtered
    .map((p) => {
      const title = escapeHtml(p.title || "Prodotto");
      const asin = escapeHtml(p.asin || "");
      const bullets = Array.isArray(p.bullets) ? p.bullets.slice(0, 3) : [];
      const bulletsHtml = bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("");

      return `
<article class="card">
  <h3>${title}</h3>
  <ul>${bulletsHtml}</ul>
  <a class="btn" href="${amazonLink(asin)}" target="_blank" rel="sponsored noopener">
    Vedi su Amazon
  </a>
  <div class="meta">ASIN: ${asin}</div>
</article>
      `.trim();
    })
    .join("");

  if (empty) {
    empty.classList.toggle("hidden", filtered.length !== 0);
  }
}

(async function main() {
  const loading = document.getElementById("loading");
  const empty = document.getElementById("empty");
  const input = document.getElementById("q");

  try {
    if (loading) loading.style.display = "block";
    if (empty) empty.classList.add("hidden");

    const raw = await loadProducts();
    const products = normalizeProducts(raw);

    render(products);

    if (input) {
      input.addEventListener("input", () => render(products, input.value));
    }
  } catch (err) {
    // Se fallisce il fetch, mostriamo un messaggio utile
    const grid = document.getElementById("grid");
    if (loading) loading.style.display = "none";
    if (empty) empty.classList.remove("hidden");

    if (grid) {
      grid.innerHTML = `
        <article class="card">
          <h3>Errore caricamento prodotti</h3>
          <p style="opacity:.9; line-height:1.4">
            ${escapeHtml(err && err.message ? err.message : String(err))}
          </p>
          <p style="opacity:.7">
            Verifica che <code>/products.json</code> esista e sia pubblicato.
          </p>
        </article>
      `;
    }
  }
})();