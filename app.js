const AFF_TAG = "tuttowowshop-21";

function amazonLink(asin) {
  return `https://www.amazon.it/dp/${encodeURIComponent(asin)}?tag=${encodeURIComponent(AFF_TAG)}`;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

async function loadProducts() {
  const res = await fetch("products.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Impossibile leggere products.json");
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("products.json deve essere un array");
  return data;
}

function render(products, query="") {
  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");

  const q = query.trim().toLowerCase();
  const filtered = q
    ? products.filter(p =>
        (p.title || "").toLowerCase().includes(q) ||
        (p.asin || "").toLowerCase().includes(q) ||
        (p.bullets || []).join(" ").toLowerCase().includes(q)
      )
    : products;

  grid.innerHTML = filtered.map(p => {
    const title = escapeHtml(p.title || "Prodotto");
    const asin = escapeHtml(p.asin || "");
    const bullets = Array.isArray(p.bullets) ? p.bullets.slice(0,3) : [];
    const bulletsHtml = bullets.map(b => `<li>${escapeHtml(b)}</li>`).join("");

    return `
      <article class="card">
        <h3>${title}</h3>
        <ul>${bulletsHtml}</ul>
        <a class="btn" href="${amazonLink(asin)}" target="_blank" rel="sponsored noopener">
          Vedi su Amazon
        </a>
        <div class="meta">ASIN: ${asin}</div>
      </article>
    `;
  }).join("");

  empty.classList.toggle("hidden", filtered.length !== 0);
}

(async function main(){
  const products = await loadProducts();
  render(products);

  const input = document.getElementById("q");
  input.addEventListener("input", () => render(products, input.value));
})();