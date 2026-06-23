"""
build_web_data.py
Aggregates articles + AI SoV data into a single monitor_data.json for the frontend.
Run from repo root: python scripts/build_web_data.py
"""
from __future__ import annotations

import json
from collections import Counter, defaultdict
from datetime import date, timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
ARTICLES_PATH = BASE_DIR / "bmw-monitor" / "public" / "data" / "articles.json"
AI_SOV_PATH   = BASE_DIR / "bmw-monitor" / "public" / "data" / "ai_sov.json"
OUT_PATH       = BASE_DIR / "bmw-monitor" / "public" / "data" / "monitor_data.json"

BRANDS = ["BMW", "Audi", "Mercedes-Benz", "Tesla", "Porsche", "Volvo", "Lexus"]
TOPICS = ["precio", "autonomia", "electrico", "diseño", "tecnologia", "fiabilidad", "conduccion", "ventas", "lanzamiento"]


def load_json(path: Path) -> list:
    if not path.exists():
        return []
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return []


def compute_media_stats(articles: list[dict]) -> dict:
    today = date.today().isoformat()
    week_ago = (date.today() - timedelta(days=7)).isoformat()
    month_ago = (date.today() - timedelta(days=30)).isoformat()

    recent = [a for a in articles if a.get("publishedAt", "") >= week_ago]
    monthly = [a for a in articles if a.get("publishedAt", "") >= month_ago]

    # Share of Voice per brand (% of articles mentioning each brand)
    def sov(arts: list[dict]) -> dict:
        total = len(arts) or 1
        counts = Counter(b for a in arts for b in a.get("brands", []))
        return {b: round(counts.get(b, 0) / total * 100, 1) for b in BRANDS}

    # Topic breakdown for BMW
    bmw_articles = [a for a in monthly if "BMW" in a.get("brands", [])]
    topic_counts = Counter(t for a in bmw_articles for t in a.get("topics", []))

    # Sentiment breakdown for BMW
    sentiment_counts = Counter(a.get("sentiment", "neutral") for a in bmw_articles)

    # Model mentions
    model_counts = Counter(m for a in bmw_articles for m in a.get("models", []))

    # Weekly trend (this week vs last week)
    last_week_ago = (date.today() - timedelta(days=14)).isoformat()
    this_week_bmw = len([a for a in recent if "BMW" in a.get("brands", [])])
    last_week_arts = [a for a in articles if last_week_ago <= a.get("publishedAt", "") < week_ago]
    last_week_bmw = len([a for a in last_week_arts if "BMW" in a.get("brands", [])])
    trend_pct = round((this_week_bmw - last_week_bmw) / max(1, last_week_bmw) * 100, 1)

    return {
        "totalArticles": len(monthly),
        "bmwArticles": len(bmw_articles),
        "sovWeek": sov(recent),
        "sovMonth": sov(monthly),
        "topicBreakdown": {t: topic_counts.get(t, 0) for t in TOPICS},
        "sentimentBreakdown": {
            "positive": sentiment_counts.get("positive", 0),
            "neutral":  sentiment_counts.get("neutral", 0),
            "negative": sentiment_counts.get("negative", 0),
        },
        "topModels": model_counts.most_common(10),
        "trendVsLastWeek": trend_pct,
    }


def compute_ai_stats(ai_results: list[dict]) -> dict:
    if not ai_results:
        return {}

    today = date.today().isoformat()
    month_ago = (date.today() - timedelta(days=30)).isoformat()
    recent = [r for r in ai_results if r.get("date", "") >= month_ago]

    total = len(recent) or 1
    bmw_found = [r for r in recent if r.get("bmwFound")]

    # BMW appearance rate
    appearance_rate = round(len(bmw_found) / total * 100, 1)

    # BMW avg rank when found
    ranks = [r["bmwRank"] for r in bmw_found if r.get("bmwRank")]
    avg_rank = round(sum(ranks) / len(ranks), 2) if ranks else None

    # BMW appearance by category
    cats = sorted({r["category"] for r in recent})
    by_cat = {}
    for cat in cats:
        cat_results = [r for r in recent if r["category"] == cat]
        cat_found = [r for r in cat_results if r.get("bmwFound")]
        by_cat[cat] = {
            "total": len(cat_results),
            "found": len(cat_found),
            "rate": round(len(cat_found) / max(1, len(cat_results)) * 100, 1),
            "avgRank": round(sum(r["bmwRank"] for r in cat_found if r.get("bmwRank")) / max(1, len([r for r in cat_found if r.get("bmwRank")])), 2) if cat_found else None,
        }

    # Top positive/negative attributes associated with BMW
    pos_attrs = Counter(a for r in bmw_found for a in r.get("bmwPositiveAttrs", []))
    neg_attrs = Counter(a for r in bmw_found for a in r.get("bmwNegativeAttrs", []))

    # BMW vs competitors: how often does each brand beat BMW (rank < bmw_rank)?
    brand_wins = Counter()
    for r in recent:
        bmw_rank = r.get("bmwRank")
        if not bmw_rank:
            continue
        for bm in r.get("brandMentions", []):
            if bm["brand"] != "BMW" and bm.get("rank", 99) < bmw_rank:
                brand_wins[bm["brand"]] += 1

    # Models mentioned in AI responses
    model_counts = Counter(m for r in bmw_found for m in r.get("bmwModels", []))

    # By LLM
    by_llm = {}
    for llm in ["groq", "gemini"]:
        llm_results = [r for r in recent if r.get("llm") == llm]
        llm_found = [r for r in llm_results if r.get("bmwFound")]
        by_llm[llm] = {
            "total": len(llm_results),
            "rate": round(len(llm_found) / max(1, len(llm_results)) * 100, 1),
        }

    return {
        "totalQueries": total,
        "bmwAppearanceRate": appearance_rate,
        "bmwAvgRank": avg_rank,
        "byCategory": by_cat,
        "positiveAttributes": pos_attrs.most_common(8),
        "negativeAttributes": neg_attrs.most_common(5),
        "competitorWins": brand_wins.most_common(),
        "topModels": model_counts.most_common(8),
        "byLLM": by_llm,
    }


def build():
    articles = load_json(ARTICLES_PATH)
    ai_results = load_json(AI_SOV_PATH)

    print(f"Articles: {len(articles)}, AI queries: {len(ai_results)}")

    media_stats = compute_media_stats(articles)
    ai_stats = compute_ai_stats(ai_results)

    # Recent articles for the news feed (last 48h, max 50)
    two_days_ago = (date.today() - timedelta(days=2)).isoformat()
    recent_articles = [a for a in articles if a.get("publishedAt", "") >= two_days_ago][:50]

    # Recent AI queries (today, for the radar view)
    today = date.today().isoformat()
    todays_queries = [r for r in ai_results if r.get("date") == today][:20]

    payload = {
        "generatedAt": today,
        "mediaStats": media_stats,
        "aiStats": ai_stats,
        "recentArticles": recent_articles,
        "recentQueries": todays_queries,
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    size_kb = OUT_PATH.stat().st_size / 1024
    print(f"Written monitor_data.json ({int(size_kb)} KB) -> {OUT_PATH}")


if __name__ == "__main__":
    build()
