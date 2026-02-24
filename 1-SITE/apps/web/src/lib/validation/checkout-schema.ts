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
    actor: z.object({
      id: z.coerce.number(),
      display_name: z.string().optional(),
    }).optional(),
    usage: z.string().optional(),
    briefing: z.string().optional(),
    pricing: z.object({
      total: z.coerce.number(),
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
  postal_code: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default('BE'),

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
    userId: z.coerce.number().optional(),
  }).optional(),
});

export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>;
