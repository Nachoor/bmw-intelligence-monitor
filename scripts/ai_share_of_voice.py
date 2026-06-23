"""
ai_share_of_voice.py
Sends questions to Groq (free) and Gemini (free) to measure
which brands AI recommends and what attributes it associates with them.
Run from repo root: python scripts/ai_share_of_voice.py
"""
from __future__ import annotations

import json
import os
import re
import time
from datetime import date
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
OUT_PATH = BASE_DIR / "bmw-monitor" / "public" / "data" / "ai_sov.json"

BRANDS = ["BMW", "Audi", "Mercedes-Benz"]

BMW_MODELS = [
    "Serie 1", "Serie 2", "Serie 3", "Serie 4", "Serie 5", "Serie 7",
    "X1", "X2", "X3", "X4", "X5", "X6", "X7",
    "i4", "i5", "i7", "iX", "iX1", "iX3",
    "M3", "M4", "M5",
]

POSITIVE_ATTRS = [
    "deportivo", "dinámico", "potente", "tecnológico", "premium", "elegante",
    "lujoso", "eficiente", "fiable", "innovador", "calidad", "conducción",
    "confort", "seguridad", "diseño", "experiencia",
]

NEGATIVE_ATTRS = [
    "caro", "precio elevado", "costoso", "problemas", "mantenimiento caro",
    "complejo", "menos autonomía", "cara",
]

QUESTIONS = [
    # Recomendación general
    {"q": "¿Qué coche premium me recomiendas por menos de 50.000€?", "cat": "recomendacion_general"},
    {"q": "¿Qué coche de lujo me recomiendas para uso familiar?", "cat": "recomendacion_general"},
    {"q": "Busco un coche ejecutivo de alta gama, ¿qué me recomiendas?", "cat": "recomendacion_general"},
    {"q": "¿Cuál es el mejor coche premium calidad-precio del mercado?", "cat": "recomendacion_general"},
    {"q": "¿Qué coche premium me recomiendas para comprar en España?", "cat": "recomendacion_general"},

    # Comparativa directa
    {"q": "¿BMW Serie 3 o Mercedes Clase C, cuál es mejor?", "cat": "comparativa"},
    {"q": "Compara BMW X5, Audi Q7 y Mercedes GLE. ¿Cuál elegirias?", "cat": "comparativa"},
    {"q": "¿BMW o Audi, cuál es mejor marca?", "cat": "comparativa"},
    {"q": "¿BMW X3 o Mercedes GLC para uso diario?", "cat": "comparativa"},
    {"q": "Entre BMW, Audi y Mercedes-Benz, ¿cuál tiene mejor relación calidad-precio?", "cat": "comparativa"},

    # Eléctrico / autonomía
    {"q": "¿Cuál es el mejor coche eléctrico de lujo por menos de 70.000€?", "cat": "electrico"},
    {"q": "¿Qué coche eléctrico premium tiene más autonomía?", "cat": "electrico"},
    {"q": "¿BMW iX o Mercedes EQS, cuál es mejor eléctrico de lujo?", "cat": "electrico"},
    {"q": "¿Qué PHEV premium me recomiendas para conducción mixta ciudad-carretera?", "cat": "electrico"},
    {"q": "¿Tesla o BMW, cuál es mejor eléctrico?", "cat": "electrico"},

    # Precio
    {"q": "¿Cuál es la marca premium más cara de mantener?", "cat": "precio"},
    {"q": "¿BMW tiene buen precio para lo que ofrece?", "cat": "precio"},
    {"q": "¿Qué marca premium ofrece más por el precio?", "cat": "precio"},
    {"q": "¿Merece la pena el precio de un BMW frente a un Mercedes?", "cat": "precio"},

    # Fiabilidad
    {"q": "¿Cuál es la marca premium más fiable, BMW, Audi o Mercedes?", "cat": "fiabilidad"},
    {"q": "¿Tienen muchos problemas los BMW?", "cat": "fiabilidad"},
    {"q": "¿Qué marca alemana de lujo tiene mejor reputación de fiabilidad?", "cat": "fiabilidad"},

    # Tecnología
    {"q": "¿Qué marca premium tiene mejor tecnología a bordo?", "cat": "tecnologia"},
    {"q": "¿BMW o Mercedes, cuál tiene mejor sistema de infoentretenimiento?", "cat": "tecnologia"},
    {"q": "¿Cuál es el coche premium más tecnológico del mercado?", "cat": "tecnologia"},

    # SUV
    {"q": "¿Cuál es el mejor SUV premium del mercado?", "cat": "suv"},
    {"q": "¿Qué SUV de lujo me recomiendas para familia con niños?", "cat": "suv"},
    {"q": "¿BMW X3 es el mejor SUV compacto premium?", "cat": "suv"},
]


def extract_brand_mentions(text: str) -> list[dict]:
    text_lower = text.lower()
    results = []
    position = 1
    for brand in BRANDS:
        pattern = re.compile(rf"\b{re.escape(brand)}\b", re.IGNORECASE)
        match = pattern.search(text)
        if match:
            # Find all occurrences to determine first position
            first_pos = match.start()
            # Extract context around the mention (±100 chars)
            start = max(0, first_pos - 100)
            end = min(len(text), first_pos + 100)
            context = text[start:end].lower()

            pos_attrs = [a for a in POSITIVE_ATTRS if a in context]
            neg_attrs = [a for a in NEGATIVE_ATTRS if a in context]

            results.append({
                "brand": brand,
                "charPosition": first_pos,
                "positiveAttributes": pos_attrs[:5],
                "negativeAttributes": neg_attrs[:3],
            })

    # Sort by position in text (earlier = higher priority recommendation)
    results.sort(key=lambda x: x["charPosition"])
    for i, r in enumerate(results):
        r["rank"] = i + 1
        del r["charPosition"]

    return results


def extract_bmw_models(text: str) -> list[str]:
    found = []
    for model in BMW_MODELS:
        if re.search(rf"\b{re.escape(model)}\b", text, re.IGNORECASE):
            found.append(model)
    return found


def query_groq(question: str) -> str | None:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        print("  GROQ_API_KEY not set, skipping Groq")
        return None
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": question}],
            max_tokens=400,
            temperature=0.3,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"  Groq error: {e}")
        return None


def query_gemini(question: str) -> str | None:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("  GEMINI_API_KEY not set, skipping Gemini")
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash-lite")
        response = model.generate_content(question)
        return response.text
    except Exception as e:
        print(f"  Gemini error: {e}")
        return None


def run_queries() -> list[dict]:
    today = date.today().isoformat()
    results = []

    for i, item in enumerate(QUESTIONS):
        print(f"  [{i+1}/{len(QUESTIONS)}] {item['q'][:60]}...")

        for llm_name, query_fn in [("groq", query_groq), ("gemini", query_gemini)]:
            response = query_fn(item["q"])
            if not response:
                continue

            brand_mentions = extract_brand_mentions(response)
            bmw_rank = next((b["rank"] for b in brand_mentions if b["brand"] == "BMW"), None)
            bmw_entry = next((b for b in brand_mentions if b["brand"] == "BMW"), None)

            results.append({
                "id": f"{today}-{i}-{llm_name}",
                "date": today,
                "question": item["q"],
                "category": item["cat"],
                "llm": llm_name,
                "response": response[:600],
                "brandMentions": brand_mentions,
                "bmwFound": bmw_rank is not None,
                "bmwRank": bmw_rank,
                "bmwPositiveAttrs": bmw_entry["positiveAttributes"] if bmw_entry else [],
                "bmwNegativeAttrs": bmw_entry["negativeAttributes"] if bmw_entry else [],
                "bmwModels": extract_bmw_models(response),
            })

        time.sleep(0.5)  # avoid rate limits

    return results


def load_existing() -> list[dict]:
    if not OUT_PATH.exists():
        return []
    try:
        return json.loads(OUT_PATH.read_text(encoding="utf-8"))
    except Exception:
        return []


def save(results: list[dict]):
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    existing = load_existing()
    # Keep last 30 days of queries
    from datetime import date, timedelta
    cutoff = (date.today() - timedelta(days=30)).isoformat()
    existing = [r for r in existing if r.get("date", "") >= cutoff]
    # Add new, deduplicate by id
    existing_ids = {r["id"] for r in existing}
    for r in results:
        if r["id"] not in existing_ids:
            existing.append(r)
    OUT_PATH.write_text(json.dumps(existing, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Saved {len(existing)} AI query results -> {OUT_PATH}")


if __name__ == "__main__":
    print("Running AI Share of Voice queries...")
    results = run_queries()
    print(f"Got {len(results)} responses")
    save(results)
