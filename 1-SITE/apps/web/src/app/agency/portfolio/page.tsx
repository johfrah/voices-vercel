import { getProducts } from "@/lib/api-server";
import { PortfolioSellingClient } from "./PortfolioSellingClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio powered by Voices.be | De complete winkel voor stemacteurs",
  description: "Zet je eigen verkoopmotor aan. Jouw eigen plek op het internet, aangedreven door de slimme techniek van Voices.",
};

export default async function PortfolioSellingPage() {
  //  BOB-METHODE: Fetch products from Supabase instead of hardcoding
  const products = await getProducts('portfolio');

  // Fallback data if no products found in DB yet
  const fallbackProducts = [
    {
      id: 1,
      name: "The Mic",
      price: "19",
      tier: "mic",
      description: "Voor de startende stem die professioneel vindbaar wil zijn.",
      features: [
        "Eigen domein (jouwnaam.be)",
        "Max. 5 demo's uploaden",
        "Max. 3 klantlogo's (statisch)",
        "Commissie: 20% per opdracht",
        "Betaling via Voices (Mollie)",
        "Basis vindbaarheid in Google"
      ]
    },
    {
      id: 2,
      name: "The Studio",
      price: "29",
      tier: "studio",
      description: "De ideale motor voor de actieve stemacteur.",
      features: [
        "Alles uit 'The Mic'",
        "Onbeperkt demo's uploaden",
        "Max. 10 klantlogo's + Showcase",
        "Persoonlijke Chat Assistent",
        "Commissie: 15% per opdracht",
        "Live Bezoekersstatistieken"
      ]
    },
    {
      id: 3,
      name: "The Agency",
      price: "49",
      tier: "agency",
      description: "Voor de gevestigde waarde die volledige regie wil.",
      features: [
        "Alles uit 'The Studio'",
        "Onbeperkt klantlogo's (in de footer)",
        "Eigen stijl (Kleuren & Fonts)",
        "Extra Pagina's (Host, Studio, etc.)",
        "Commissie: 10% per opdracht",
        "Eigen naam in de header"
      ]
    }
  ];

  return <PortfolioSellingClient products={products.length > 0 ? products : fallbackProducts} />;
}
