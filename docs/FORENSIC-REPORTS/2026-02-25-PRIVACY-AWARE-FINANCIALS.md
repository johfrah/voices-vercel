# 🔐 Privacy-Aware Financial Architecture: Admin vs. Client (V2)

In de **Bob-methode** is data-integriteit ook data-privacy. We maken een vlijmscherp onderscheid tussen de **Publieke Waarheid** (wat de klant ziet) en de **Interne Waarheid** (de boekhouding van Johfrah).

## 1. De Twee Financiële Lagen

### 🟢 De Client-Facing Laag (Zichtbaar in Account Dashboard)
Dit zijn de atomen die de klant mag zien op zijn factuur en in zijn bestelgeschiedenis.
- **`subtotal_net`**: De prijs per stem/item (zoals berekend door de Slimme Kassa).
- **`discount_net`**: Eventuele kortingen die de klant heeft gekregen.
- **`total_net`**: De uiteindelijke netto omzet.
- **`total_tax`**: De BTW die de klant betaalt.
- **`total_gross`**: Het totaalbedrag inclusief BTW.

### 🔴 De Admin-Only Laag (STRIKT PRIVÉ - Alleen voor BOB & Chris)
Deze velden worden in de API **nooit** naar de frontend gestuurd, tenzij de gebruiker een `admin` rol heeft.
- **`supplier_cost` (COG)**: Wat wij betalen aan de stemacteur of muzikant.
- **`total_profit`**: De zuivere marge op de order.
- **`gateway_cost`**: De transactiekosten van Mollie/Stripe.
- **`yuki_xml_audit`**: De volledige technische handshake met de boekhouding.

## 2. Architectuur in de Database (V2)

We groeperen deze velden in de tabel zodat er nooit verwarring ontstaat over wat "veilig" is om te tonen.

```sql
-- 🛡️ CHRIS-PROTOCOL: Orders V2 Privacy Mapping
ALTER TABLE orders_v2 
-- Publiek
ADD COLUMN client_total_net NUMERIC(10, 2),
ADD COLUMN client_total_tax NUMERIC(10, 2),
-- Privé (Admin Only)
ADD COLUMN admin_supplier_cost NUMERIC(10, 2),
ADD COLUMN admin_total_profit NUMERIC(10, 2),
ADD COLUMN admin_internal_notes TEXT;
```

## 3. De "Zero-Leak" Garantie
In de nieuwe API-laag van V2 bouwen we een **Privacy Filter**:
1.  De API haalt de volledige order op uit de database.
2.  Het filter kijkt naar de rol van de ingelogde gebruiker.
3.  Ben je een klant? Dan worden alle `admin_` velden uit het object gestript voordat ze je browser bereiken.

---

## 🎭 Sjareltje's Conclusie
Door de **COG (inkoop)** en **Profit (winst)** nu al een `admin_` prefix te geven in onze atomaire waarheid, voorkomen we dat deze privé-informatie ooit per ongeluk in een klant-dashboard belandt. Jouw inkoop-afspraken met stemmen blijven 100% geheim.

**Zal ik deze privacy-bewuste splitsing nu definitief verankeren in het SQL-migratieplan?** Dan is je boekhouding veilig en je klant optimaal geïnformeerd. 🚀🤝💎
