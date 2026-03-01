# 🚀 Nuclear Orders V2: The Handshake Blueprint (Scenario B)

Dit is het definitieve ontwerp voor de nieuwe order-architectuur van **Voices**. We elimineren alle herhaling en bouwen een onverwoestbare "1 Truth" koppeling tussen klanten, producten en transacties.

## 1. De Nieuwe Tabellen (SQL)

We voegen twee nieuwe tabellen toe die naast de legacy `orders` blijven bestaan totdat de migratie voltooid is.

```sql
-- 🛡️ CHRIS-PROTOCOL: Nuclear Orders V2
CREATE TABLE IF NOT EXISTS orders_v2 (
    id SERIAL PRIMARY KEY,
    display_id TEXT UNIQUE NOT NULL, -- Bijv. V26-1001
    user_id INTEGER NOT NULL REFERENCES users(id),
    status TEXT DEFAULT 'pending', -- pending, paid, completed, cancelled
    market_code TEXT DEFAULT 'BE',
    journey TEXT DEFAULT 'agency',
    
    -- Financiële 1 Truth (geen strings, maar numeriek)
    total_net NUMERIC(10, 2) DEFAULT 0.00,
    total_tax NUMERIC(10, 2) DEFAULT 0.00,
    total_gross NUMERIC(10, 2) DEFAULT 0.00,
    
    -- Metadata & Audit
    currency TEXT DEFAULT 'EUR',
    internal_notes TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🔗 DE KOPPELTABEL (The Handshake)
CREATE TABLE IF NOT EXISTS order_items_v2 (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders_v2(id) ON DELETE CASCADE,
    
    -- Polymorfische Koppeling (1 Truth naar de bron)
    actor_id INTEGER REFERENCES actors(id),
    workshop_id BIGINT REFERENCES workshops(id),
    product_id INTEGER REFERENCES products(id),
    
    -- Snapshot Data (voor historische integriteit)
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    tax_rate NUMERIC(5, 2) DEFAULT 21.00,
    
    -- Item-specifieke metadata (geen bios!)
    -- Bijv: { "script": "...", "usage": "TV 1 year", "spots": 2 }
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexen voor razendsnelle dashboards
CREATE INDEX idx_orders_v2_user_id ON orders_v2(user_id);
CREATE INDEX idx_order_items_v2_order_id ON order_items_v2(order_id);
```

## 2. De "Zero Slop" Regels

1.  **Geen Bios**: De `order_items_v2` tabel bevat **NOOIT** de bio, foto of naam van een acteur. Als we die nodig hebben, doen we een `JOIN` op `actors`.
2.  **Geen Dubbele Prijzen**: De `total_gross` in `orders_v2` moet altijd de som zijn van de `order_items_v2`.
3.  **Verplichte User**: Een order zonder `user_id` is verboden. Gasten krijgen eerst een record in de `users` tabel (Guest-status).
4.  **Historische Snapshot**: De `unit_price` wordt opgeslagen op het moment van aankoop. Als de acteur later zijn prijs verhoogt, blijft de oude order financieel correct.

## 3. Implementatie Plan

1.  **Stap 1: SQL Injectie**: Ik voer bovenstaande SQL uit in de Supabase SQL Editor.
2.  **Stap 2: Drizzle Sync**: Ik voeg de nieuwe definities toe aan `1-SITE/packages/database/schema.ts`.
3.  **Stap 3: API Bridge**: De `/api/admin/orders` route gaat voortaan beide tabellen uitlezen (`orders` + `orders_v2`) en samenvoegen in één overzicht.
4.  **Stap 4: De Grote Schoonmaak**: Nieuwe bestellingen gaan direct in V2. Oude bestellingen worden op de achtergrond "gezuiverd" en overgezet.

**Ben je akkoord met deze SQL-structuur? Dan schiet ik het nu in de database.** 🚀🤝
