# 📜 Financial & Workflow History: De Onverwoestbare Audit-Trail (V2)

In de **Bob-methode** is een order geen statisch record, maar een **levende geschiedenis**. Voor de Admin (BOB & Chris) is het cruciaal om niet alleen de *huidige* status te zien, maar het volledige pad dat een order heeft afgelegd.

## 1. De `order_history_v2` Tabel (De Zwarte Doos)
We introduceren een speciale tabel die elke statuswijziging, betaling en administratieve actie vastlegt. Dit is de "Zwarte Doos" van elke bestelling.

```sql
-- 🛡️ CHRIS-PROTOCOL: Financial & Workflow History
CREATE TABLE IF NOT EXISTS order_history_v2 (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders_v2(id) ON DELETE CASCADE,
    
    -- De Actie
    event_type TEXT NOT NULL, -- 'status_change', 'payment_received', 'refund_issued', 'actor_notified', 'note_added'
    from_status_id INTEGER,   -- Verwijst naar de ID-First status tabel
    to_status_id INTEGER,     -- Verwijst naar de ID-First status tabel
    
    -- De Details
    amount NUMERIC(10, 2),    -- Bijv. het bedrag van een (deel)betaling of refund
    actor_id INTEGER,         -- Indien de actie een specifieke acteur betreft
    admin_id INTEGER,         -- Wie heeft de wijziging doorgevoerd? (Link naar users.id)
    
    -- Gouden Metadata Snapshot
    -- Bijv: { "reason": "Klant wilde andere tone-of-voice", "transaction_id": "tr_..." }
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_history_v2_order_id ON order_history_v2(order_id);
```

## 2. Wat we hiermee bewaren (De Admin Kracht)

| Gebeurtenis | Wat we vastleggen | Waarom? |
| :--- | :--- | :--- |
| **Betaling** | Datum, Bedrag, Mollie ID, Status (Paid) | Voor Kelly (Kassa) en de winstanalyse. |
| **Terugbetaling** | Datum, Bedrag, Reden, Admin ID | Cruciaal voor Lex (Legal) en de boekhouding. |
| **Status-Flow** | Van 'Pending' naar 'Paid' naar 'In Production' | Om knelpunten in de workflow te ontdekken. |
| **Admin Notes** | Interne opmerkingen die niet voor de klant zijn | De "geheugensteun" voor Johfrah en het team. |

## 3. De "Huzarenstukje" Migratie van Legacy History
Omdat de legacy data vaak versnipperd is in `raw_meta` (bijv. `_date_paid`, `_completed_date`), gaan we deze bij de migratie **reconstrueren**:
*   We maken voor elke legacy order een initiële `order_history_v2` entry aan op basis van de beschikbare tijdstempels in de metadata.
*   Hierdoor ziet het dashboard voor een order uit 2021 ook een keurige tijdlijn: *"Betaald op 12 maart, Afgerond op 14 maart"*.

---

## 🎭 Sjareltje's Dashboard Visie
In het nieuwe Admin Dashboard komt een **"Timeline" widget**. Hierin zie je in één oogopslag de volledige biografie van de order. Geen gezoek meer in JSON-velden, maar een heldere, chronologische lijst van gebeurtenissen.

**Zal ik deze historie-architectuur nu definitief meenemen in het SQL-migratieplan?** Dan is je audit-trail voor altijd geborgd. 🚀🤝💎
