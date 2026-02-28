function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadProducts() {
  const res = await fetch("/products.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Impossibile leggere /products.json (HTTP ${res.status})`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("products.json deve essere un array");
  return data;
}

function render(products, query = "") {
  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");
  const loading = document.getElementById("loading");

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
      const title = escapeHtml(p.title || `Prodotto Amazon (ASIN ${rawAsin})`);
      const asinSafe = escapeHtml(rawAsin);

      const amazonUrl = (p.amazonUrl || "").trim();
      const safeAmazonUrl = escapeHtml(amazonUrl);

      const bullets = Array.isArray(p.bullets) ? p.bullets.slice(0, 3) : [];
      const bulletsHtml = bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("");

      const imgUrl = (p.imageUrl || "").trim();
      const imgTag = imgUrl
        ? `<img class="card-img" src="${escapeHtml(imgUrl)}" alt="${title}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`
        : `<div class="card-img" aria-hidden="true"></div>`;

      return `
        <article class="card">
          <div class="card-head">
            ${imgTag}
            <h3>${title}</h3>
          </div>

          <ul>${bulletsHtml}</ul>

          <a class="btn" href="${safeAmazonUrl}" target="_blank" rel="sponsored noopener">
            Vedi su Amazon
          </a>

          <div class="meta">ASIN: ${asinSafe}</div>
        </article>
      `;
    })
    .join("");

  empty.classList.toggle("hidden", filtered.length !== 0);
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
      empty.innerHTML = `<strong>Errore caricamento prodotti</strong><br>${escapeHtml(err.message || String(err))}`;
    }
  }
}

main();