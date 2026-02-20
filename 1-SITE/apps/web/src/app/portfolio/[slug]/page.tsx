import { getActor } from "@/lib/api-server";
import { notFound } from "next/navigation";
import { PortfolioDetailClient } from "./PortfolioDetailClient";
import { Metadata } from "next";
import { headers } from "next/headers";

interface PortfolioPageParams {
  slug: string;
}

export async function generateMetadata({ params }: { params: PortfolioPageParams }): Promise<Metadata> {
  const headersList = headers();
  const lang = headersList.get('x-voices-lang') || 'nl';
  const actor = await getActor(params.slug, lang);

  if (!actor) return {};

  return {
    title: `${actor.display_name} | Portfolio`,
    description: actor.bio || `Ontdek het portfolio van ${actor.display_name}.`,
  };
}

export default async function PortfolioPage({ params }: { params: PortfolioPageParams }) {
  const headersList = headers();
  const lang = headersList.get('x-voices-lang') || 'nl';
  const actor = await getActor(params.slug, lang);

  if (!actor) {
    return notFound();
  }

  return <PortfolioDetailClient actor={actor} />;
}
