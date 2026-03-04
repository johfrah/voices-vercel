import { z } from 'zod';

/**
 * 🛡️ NUCLEAR CHECKOUT CONTRACT (2026)
 * 
 * Dit contract definieert de exacte structuur van een bestelling.
 * Elke afwijking wordt aan de poort (API) geweigerd of gecorrigeerd.
 * 
 * CHRIS-PROTOCOL: Gebruik .coerce voor automatische type-correctie (Anti-Pleister).
 */

export const CheckoutPayloadSchema = z.object({
  // 1. Prijs & Validatie
  pricing: z.object({
    total: z.coerce.number().positive(),
    cartHash: z.string().optional(),
    base: z.coerce.number().optional(),
    wordSurcharge: z.coerce.number().optional(),
    mediaSurcharge: z.coerce.number().optional(),
    musicSurcharge: z.coerce.number().optional(),
  }),

  // 2. Items in mandje
  items: z.array(z.object({
    id: z.string(),
    type: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    quantity: z.coerce.number().optional(),
    workshop_id: z.coerce.number().optional(),
    workshopId: z.coerce.number().optional(),
    edition_id: z.coerce.number().optional(),
    editionId: z.coerce.number().optional(),
    price: z.coerce.number().optional(),
    thumbnail_url: z.string().optional(),
    featured_image_url: z.string().optional(),
    image_url: z.string().optional(),
    media_url: z.string().optional(),
    project_code: z.string().optional(),
    actor: z.object({
      id: z.coerce.number(),
      display_name: z.string().optional(),
      first_name: z.string().optional(),
      photo_url: z.string().optional(),
      thumbnail_url: z.string().optional(),
      delivery_time: z.string().optional(),
      deliveryTime: z.string().optional(),
    }).optional(),
    usage: z.string().optional(),
    briefing: z.string().optional(),
    pricing: z.object({
      total: z.coerce.number(),
      subtotal: z.coerce.number().optional(),
      tax: z.coerce.number().optional(),
    }).optional(),
  })).default([]),

  selectedActor: z.object({
    id: z.coerce.number(),
    display_name: z.string().optional(),
  }).nullable().optional(),

  step: z.string().optional(),

  // 3. Klantgegevens
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().optional(),
  company: z.string().optional(),
  vat_number: z.string().optional(),
  address_street: z.string().optional(),
  postal_code: z.string().min(1, "Postcode is verplicht"),
  city: z.string().min(1, "Stad is verplicht"),
  country: z.string().default('BE'),
  language: z.string().regex(/^[a-z]{2}(-[a-z]{2})?$/i).default('nl-be'),

  // 4. Project Context
  usage: z.enum(['unpaid', 'commercial', 'telefonie', 'subscription']).default('unpaid'),
  plan: z.string().optional(),
  briefing: z.string().default(''),
  quoteMessage: z.string().nullable().optional(),
  payment_method: z.string().default('bancontact'),
  
  music: z.object({
    trackId: z.string().nullable().optional(),
    asBackground: z.boolean().default(false),
    asHoldMusic: z.boolean().default(false),
  }).optional(),
  
  // 5. Metadata
  metadata: z.object({
    words: z.coerce.number().default(0),
    prompts: z.coerce.number().default(0),
    user_id: z.coerce.number().optional(),
  }).optional(),
});

export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>;
