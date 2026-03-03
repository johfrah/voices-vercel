# 📊 API DATA CONTRACT: ANALYTICS HUB (2026)

**Status:** Draft / Nuclear Ready
**Source:** `src/30-systems/backoffice/350-analytics-hub.php`
**Target:** `src/50-apps/backoffice-cockpit/analytics/`

---

## 🏗️ 1. DATA STRUCTURE (JSON)

De API moet een geconsolideerd object teruggeven dat de volledige business intelligence laag ontsluit.

```typescript
interface AnalyticsHubResponse {
  period: {
    start: string; // ISO date
    end: string;   // ISO date
    label: string; // e.g. "Februari 2026"
  };
  
  // 📈 CORE KPI'S (Bento Top Row)
  kpis: {
    revenue: {
      value: number;
      change: number; // percentage
      target: number;
      formatted: string;
    };
    leads: {
      value: number;
      change: number;
      quality_score: number;
    };
    conversions: {
      value: number;
      rate: number;
      change: number;
    };
    active_visitors: {
      current: number;
      peak_today: number;
    };
  };

  // 🌍 TRAFFIC & SOURCES
  traffic: {
    total_sessions: number;
    unique_visitors: number;
    sources: Array<{
      name: string; // e.g. "Google", "Direct", "LinkedIn"
      sessions: number;
      conversion_rate: number;
      trend: 'up' | 'down' | 'stable';
    }>;
    top_pages: Array<{
      url: string;
      views: number;
      avg_duration: number;
    }>;
  };

  // 🧠 INTELLIGENCE (IAP Insights)
  intelligence: {
    predictive_revenue: number;
    hot_leads: Array<{
      id: string;
      name: string;
      intent: string;
      score: number;
    }>;
    anomalies: Array<{
      type: 'warning' | 'opportunity';
      message: string;
    }>;
  };

  // 🎙️ JOURNEY PERFORMANCE
  journeys: {
    agency: JourneyStats;
    studio: JourneyStats;
    academy: JourneyStats;
    artists: JourneyStats;
    meditation: JourneyStats;
  };
}

interface JourneyStats {
  revenue: number;
  orders: number;
  avg_order_value: number;
  growth: number;
}
```

---

## 🔌 2. ENDPOINT SPECIFICATIE

- **URL:** `/wp-json/voices/v2/analytics/hub`
- **Method:** `GET`
- **Auth:** Bearer Token (IAP Auth Bridge)
- **Params:**
  - `period`: `this_month` | `last_month` | `this_year` | `custom`
  - `start_date`: YYYY-MM-DD (optioneel)
  - `end_date`: YYYY-MM-DD (optioneel)

---

## 🛡️ 3. SECURITY & PERFORMANCE

- **Cache:** 5 minuten server-side caching via transients.
- **Privacy:** Alle IP-data is gehasht (`wp_voices_visitors.ip_hash`).
- **Data Integrity:** Directe koppeling met `wp_voices_visitors` en `wp_wc_order_stats`.
