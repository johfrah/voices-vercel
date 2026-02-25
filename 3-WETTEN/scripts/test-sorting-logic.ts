import { calculateDeliveryDate } from "../../1-SITE/apps/web/src/lib/delivery-logic";

function testSorting() {
  console.log("🧪 TESTING DELIVERY SORTING LOGIC...");
  
  // Test scenario: Today is Thursday Feb 19, 2026, 14:30 (After Johfrah's 12:00 cutoff)
  const baseDate = new Date("2026-02-19T14:30:00");
  console.log(`Base Date: ${baseDate.toString()}`);

  const johfrah = {
    id: 1760,
    name: "Johfrah",
    deliveryDaysMin: 0,
    deliveryDaysMax: 1,
    cutoffTime: "12:00",
    availability: []
  };

  const kirsten = {
    id: 1715,
    name: "Kirsten",
    deliveryDaysMin: 1,
    deliveryDaysMax: 2,
    cutoffTime: "18:00", // Default fallback in code
    availability: []
  };

  const deliveryJ = calculateDeliveryDate(johfrah, new Date("2026-02-19T11:00:00"), ['mon', 'tue', 'wed', 'thu', 'fri']);
  const deliveryK = calculateDeliveryDate(kirsten, new Date("2026-02-19T11:00:00"), ['mon', 'tue', 'wed', 'thu', 'fri']);

  console.log("\n--- JOHFRAH ---");
  console.log(`Min Date: ${deliveryJ.dateMin.toDateString()}`);
  console.log(`Formatted: ${deliveryJ.formatted}`);

  console.log("\n--- KIRSTEN ---");
  console.log(`Min Date: ${deliveryK.dateMin.toDateString()}`);
  console.log(`Formatted: ${deliveryK.formatted}`);

  const diff = deliveryJ.dateMin.getTime() - deliveryK.dateMin.getTime();
  console.log(`\nSort Difference (J - K): ${diff}`);
  if (diff > 0) console.log("❌ RESULT: Kirsten sorts BEFORE Johfrah");
  else if (diff < 0) console.log("✅ RESULT: Johfrah sorts BEFORE Kirsten");
  else console.log("⚖️ RESULT: Equal sorting");
}

testSorting();
