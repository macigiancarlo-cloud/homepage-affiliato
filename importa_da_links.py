import json
import re
from pathlib import Path

ASIN_PATTERNS = [
    r"/dp/([A-Z0-9]{10})",
    r"/gp/product/([A-Z0-9]{10})",
    r"/gp/aw/d/([A-Z0-9]{10})",
    r"[?&]pd_rd_i=([A-Z0-9]{10})",
    r"[?&]asin=([A-Z0-9]{10})",
    r"[?&]ASIN=([A-Z0-9]{10})",
]

def extract_asin(url: str) -> str:
    for pat in ASIN_PATTERNS:
        m = re.search(pat, url, re.I)
        if m:
            return m.group(1).upper()
    raise ValueError(f"ASIN non trovato nel link: {url}")

def split_line(line: str):
    return [x.strip() for x in re.split(r"\s*[|¦｜]\s*", line.strip()) if x.strip()]

def main():
    links = Path("links.txt")
    products_file = Path("products.json")

    if not links.exists():
        raise SystemExit("ERRORE: manca links.txt")

    products = []
    if products_file.exists():
        products = json.loads(products_file.read_text(encoding="utf-8"))
        if not isinstance(products, list):
            raise SystemExit("ERRORE: products.json deve essere un array")

    by_asin = {(p.get("asin", "").strip().upper()): p for p in products if p.get("asin")}

    lines = [ln.strip() for ln in links.read_text(encoding="utf-8").splitlines() if ln.strip()]

    added = 0
    updated = 0

    for i, line in enumerate(lines, start=1):
        parts = split_line(line)

        title = ""
        amazon_url = ""
        image_url = ""
        categoria = "Altro"

        # Formato: Titolo | URL Amazon | URL Immagine | Categoria (opzionale)
        if len(parts) == 4:
            title, amazon_url, image_url, categoria = parts
        elif len(parts) == 3:
            title, amazon_url, image_url = parts
        elif len(parts) == 2:
            if parts[0].lower().startswith("http"):
                amazon_url, image_url = parts
            else:
                title, amazon_url = parts
        elif len(parts) == 1:
            amazon_url = parts[0]
        else:
            raise SystemExit(f"Riga {i} non valida. Usa: Titolo | LinkAmazon | LinkImmagine | Categoria(opz.)")

        asin = extract_asin(amazon_url)

        if not title:
            title = f"Prodotto Amazon ({asin})"

        newp = {
            "asin": asin,
            "title": title,
            "amazonUrl": amazon_url,
            "imageUrl": image_url,
            "categoria": categoria,
            "bullets": [
                "Dettagli e varianti su Amazon",
                "Controlla accessori/varianti disponibili",
                "Prezzo e disponibilità aggiornati su Amazon"
            ]
        }

        if asin in by_asin:
            by_asin[asin].update(newp)
            updated += 1
        else:
            products.append(newp)
            by_asin[asin] = newp
            added += 1

    products_file.write_text(json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK: aggiunti {added}, aggiornati {updated}. Salvato products.json")

if __name__ == "__main__":
    main()
