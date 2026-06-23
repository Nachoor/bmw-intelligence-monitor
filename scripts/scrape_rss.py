"""
scrape_rss.py
Fetches articles from Spanish automotive RSS feeds and Google News.
Detects brand/model mentions and classifies topics.
Run from repo root: python scripts/scrape_rss.py
"""
from __future__ import annotations

import json
import re
import hashlib
from datetime import datetime, timezone
from pathlib import Path

import feedparser
import requests

BASE_DIR = Path(__file__).resolve().parents[1]
OUT_PATH = BASE_DIR / "bmw-monitor" / "public" / "data" / "articles.json"

RSS_FEEDS = [
    {"name": "Diario Motor",       "url": "https://www.diariomotor.com/feed/"},
    {"name": "Auto Bild ES",       "url": "https://www.autobild.es/rss"},
    {"name": "Autofácil",          "url": "https://www.autofacil.es/rss"},
    {"name": "Motor El País",      "url": "https://motor.elpais.com/rss/"},
    {"name": "20minutos Motor",    "url": "https://www.20minutos.es/rss/motor.xml"},
    {"name": "La Vanguardia Motor","url": "https://www.lavanguardia.com/rss/motor.xml"},
]

GOOGLE_NEWS_QUERIES = [
    # BMW
    "BMW España",
    "BMW eléctrico España",
    "BMW precio España",
    "BMW nuevo modelo España",
    "BMW Serie 3 España",
    "BMW X5 España",
    # Audi
    "Audi España",
    "Audi eléctrico España",
    "Audi precio España",
    "Audi nuevo modelo España",
    "Audi Q5 España",
    "Audi e-tron España",
    # Mercedes-Benz
    "Mercedes-Benz España",
    "Mercedes eléctrico España",
    "Mercedes precio España",
    "Mercedes nuevo modelo España",
    "Mercedes Clase C España",
    "Mercedes EQS España",
    # Comparativas
    "BMW Audi Mercedes comparativa España",
    "coches premium lujo España 2025",
]

BRANDS = {
    "BMW":           r"\bBMW\b",
    "Audi":          r"\bAudi\b",
    "Mercedes-Benz": r"\bMercedes(?:-Benz)?\b",
}

BMW_MODELS = [
    "Serie 1", "Serie 2", "Serie 3", "Serie 4", "Serie 5", "Serie 6", "Serie 7", "Serie 8",
    "X1", "X2", "X3", "X4", "X5", "X6", "X7", "XM",
    "i3", "i4", "i5", "i7", "iX", "iX1", "iX3",
    "M2", "M3", "M4", "M5", "M8", "Z4",
]

AUDI_MODELS = [
    "A1", "A3", "A4", "A5", "A6", "A7", "A8",
    "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8",
    "e-tron", "Q4 e-tron", "Q8 e-tron",
    "RS3", "RS4", "RS5", "RS6", "RS7",
    "TT", "R8",
]

MERCEDES_MODELS = [
    "Clase A", "Clase B", "Clase C", "Clase E", "Clase S",
    "GLA", "GLB", "GLC", "GLE", "GLS", "EQA", "EQB", "EQC", "EQE", "EQS",
    "AMG GT", "CLA", "CLS", "Sprinter",
]

TOPICS = {
    "precio":      ["precio", "coste", "vale", "cuesta", "económico", "caro", "barato", "oferta",
                    "descuento", "financiación", "cuota", "€", "euros", "rebaja"],
    "autonomia":   ["autonomía", "autonomia", "batería", "bateria", "carga", "recarga",
                    "kilómetros", "km de", "range", "alcance"],
    "electrico":   ["eléctrico", "electrico", "BEV", "EV", "enchufable", "PHEV",
                    "híbrido", "hibrido", "cero emisiones", "emisiones"],
    "diseño":      ["diseño", "diseno", "interior", "exterior", "carrocería", "carroceria",
                    "estética", "lineas", "acabado", "habitáculo"],
    "tecnologia":  ["tecnología", "tecnologia", "pantalla", "software", "conectividad",
                    "digital", "asistente", "sistema", "iDrive", "MBUX"],
    "fiabilidad":  ["fiabilidad", "fiable", "problemas", "averías", "averia",
                    "calidad", "garantía", "durabilidad", "fallo"],
    "conduccion":  ["conducción", "conduccion", "deportivo", "dinámico", "dinamico",
                    "ágil", "agil", "potencia", "motor", "CV", "tracción", "traccion"],
    "ventas":      ["ventas", "matriculaciones", "cuota de mercado", "récord", "record",
                    "líder", "lider", "más vendido"],
    "lanzamiento": ["nuevo", "lanzamiento", "presentación", "presentacion", "debut",
                    "estreno", "llega", "llegará", "llegar"],
    "competencia": ["frente a", "vs", "versus", "comparativa", "rival", "competidor",
                    "alternativa", "gana a", "supera"],
}

POSITIVE_WORDS = {"mejor", "excelente", "superior", "líder", "innovador", "potente",
                  "eficiente", "elegante", "premium", "recomendado", "gana", "supera",
                  "récord", "nuevo", "lujoso", "deportivo", "avanzado"}
NEGATIVE_WORDS = {"problema", "fallo", "avería", "caro", "cuesta", "cara", "defecto",
                  "retirada", "recall", "denuncia", "crítica", "peor", "inferior"}


def detect_brands(text: str) -> list[str]:
    found = []
    for brand, pattern in BRANDS.items():
        if re.search(pattern, text, re.IGNORECASE):
            found.append(brand)
    return found


def detect_models(text: str, brands: list[str]) -> list[str]:
    found = []
    if "BMW" in brands:
        for model in BMW_MODELS:
            if re.search(rf"\b{re.escape(model)}\b", text, re.IGNORECASE):
                found.append(model)
    if "Audi" in brands:
        for model in AUDI_MODELS:
            if re.search(rf"\b{re.escape(model)}\b", text, re.IGNORECASE):
                found.append(model)
    if "Mercedes-Benz" in brands:
        for model in MERCEDES_MODELS:
            if re.search(rf"\b{re.escape(model)}\b", text, re.IGNORECASE):
                found.append(model)
    return found


def detect_topics(text: str) -> list[str]:
    text_lower = text.lower()
    found = []
    for topic, keywords in TOPICS.items():
        if any(kw in text_lower for kw in keywords):
            found.append(topic)
    return found


def detect_sentiment(text: str) -> str:
    text_lower = text.lower()
    pos = sum(1 for w in POSITIVE_WORDS if w in text_lower)
    neg = sum(1 for w in NEGATIVE_WORDS if w in text_lower)
    if pos > neg + 1:
        return "positive"
    if neg > pos + 1:
        return "negative"
    return "neutral"


def parse_date(entry) -> str:
    for field in ("published_parsed", "updated_parsed"):
        t = getattr(entry, field, None)
        if t:
            try:
                return datetime(*t[:6], tzinfo=timezone.utc).isoformat()
            except Exception:
                pass
    return datetime.now(timezone.utc).isoformat()


def fetch_feed(source: dict) -> list[dict]:
    try:
        r = requests.get(source["url"], timeout=12, headers={"User-Agent": "Mozilla/5.0"})
        feed = feedparser.parse(r.text)
        articles = []
        for entry in feed.entries[:50]:
            text = f"{entry.get('title', '')} {entry.get('summary', '')}"
            brands = detect_brands(text)
            if not brands:
                continue
            articles.append({
                "id": hashlib.md5(entry.get("link", text).encode()).hexdigest()[:12],
                "title": entry.get("title", "").strip(),
                "description": re.sub(r"<[^>]+>", "", entry.get("summary", "")).strip()[:300],
                "url": entry.get("link", ""),
                "source": source["name"],
                "publishedAt": parse_date(entry),
                "brands": brands,
                "models": detect_models(text, brands),
                "topics": detect_topics(text),
                "sentiment": detect_sentiment(text),
            })
        print(f"  {source['name']}: {len(articles)} relevant articles")
        return articles
    except Exception as e:
        print(f"  {source['name']}: ERROR — {e}")
        return []


def fetch_google_news(query: str) -> list[dict]:
    url = f"https://news.google.com/rss/search?q={requests.utils.quote(query)}&hl=es&gl=ES&ceid=ES:es"
    return fetch_feed({"name": f"Google News ({query})", "url": url})


def scrape() -> list[dict]:
    print("Scraping RSS feeds...")
    all_articles: list[dict] = []
    seen_ids: set[str] = set()

    for source in RSS_FEEDS:
        for art in fetch_feed(source):
            if art["id"] not in seen_ids:
                all_articles.append(art)
                seen_ids.add(art["id"])

    print("Fetching Google News...")
    for query in GOOGLE_NEWS_QUERIES:
        for art in fetch_google_news(query):
            if art["id"] not in seen_ids:
                all_articles.append(art)
                seen_ids.add(art["id"])

    all_articles.sort(key=lambda a: a["publishedAt"], reverse=True)
    print(f"Total: {len(all_articles)} articles")
    return all_articles


def load_existing() -> list[dict]:
    if not OUT_PATH.exists():
        return []
    try:
        return json.loads(OUT_PATH.read_text(encoding="utf-8"))
    except Exception:
        return []


def save(articles: list[dict]):
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    existing = {a["id"]: a for a in load_existing()}
    for a in articles:
        existing[a["id"]] = a
    merged = sorted(existing.values(), key=lambda a: a["publishedAt"], reverse=True)[:900]
    OUT_PATH.write_text(json.dumps(merged, ensure_ascii=False, indent=None, separators=(",", ":")), encoding="utf-8")
    print(f"Saved {len(merged)} articles -> {OUT_PATH}")


if __name__ == "__main__":
    articles = scrape()
    save(articles)
