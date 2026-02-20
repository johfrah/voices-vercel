import { getActor } from "@/lib/api-server";
import { notFound } from "next/navigation";
import { PortfolioBestelClient } from "./PortfolioBestelClient";
import { Metadata } from "next";
import { headers } from "next/headers";

interface BestelPageParams {
  slug: string;
}

export async function generateMetadata({ params }: { params: BestelPageParams }): Promise<Metadata> {
  const headersList = headers();
  const lang = headersList.get('x-voices-lang') || 'nl';
  const actor = await getActor(params.slug, lang);

  if (!actor) return {};

  return {
    title: `Bestellen bij ${actor.display_name} | Portfolio`,
    description: `Start direct je project met ${actor.display_name}.`,
  };
}

export default async function BestelPage({ params }: { params: BestelPageParams }) {
  const headersList = headers();
  const lang = headersList.get('x-voices-lang') || 'nl';
  const actor = await getActor(params.slug, lang);

  if (!actor) {
    return notFound();
  }

  return <PortfolioBestelClient actor={actor} />;
}
