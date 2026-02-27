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
  // Percorso assoluto: funziona bene su Vercel e su dominio
  const res = await fetch("/products.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Impossibile leggere products.json");
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("products.json deve essere un array");
  return data;
}

function render(products, query = "") {
  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");
  const loading = document.getElementById("loading");

  if (!grid || !empty || !loading) {
    // Se manca un ID, meglio fermarsi con un errore chiaro
    console.error("ID mancanti in index.html (grid/empty/loading).");
    return;
  }

  const q = query.trim().toLowerCase();

  const filtered = q
    ? products.filter((p) => {
        const title = (p.title || "").toLowerCase();
        const asin = (p.asin || "").toLowerCase();
        const bullets = Array.isArray(p.bullets) ? p.bullets.join(" ").toLowerCase() : "";
        return title.includes(q) || asin.includes(q) || bullets.includes(q);
      })
    : products;

  // Stop loading
  loading.classList.add("hidden");

  if (filtered.length === 0) {
    grid.innerHTML = "";
    empty.textContent = "Nessun prodotto trovato.";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");

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
      `;
    })
    .join("");
}

(async function main() {
  const empty = document.getElementById("empty");
  const loading = document.getElementById("loading");

  try {
    const products = await loadProducts();
    render(products);

    const input = document.getElementById("q");
    if (input) {
      input.addEventListener("input", () => render(products, input.value));
    }
  } catch (err) {
    console.error(err);
    if (loading) loading.classList.add("hidden");
    if (empty) {
      empty.textContent = `Errore caricamento prodotti: ${err.message}`;
      empty.classList.remove("hidden");
    }
  }
})();