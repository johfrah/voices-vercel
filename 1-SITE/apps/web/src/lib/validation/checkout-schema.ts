import { z } from 'zod';

/**
 * 🛡️ NUCLEAR CHECKOUT CONTRACT (2026)
 * 
 * Dit contract definieert de exacte structuur van een bestelling.
 * Elke afwijking wordt aan de poort (API) geweigerd.
 */

export const CheckoutPayloadSchema = z.object({
  // 1. Prijs & Validatie
  pricing: z.object({
    total: z.number().positive(),
    cartHash: z.string().optional(),
    base: z.number().optional(),
    wordSurcharge: z.number().optional(),
    mediaSurcharge: z.number().optional(),
    musicSurcharge: z.number().optional(),
  }),

  // 2. Items in mandje
  items: z.array(z.any()).default([]),
  selectedActor: z.any().nullable().optional(),
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
  
  // 5. Metadata
  metadata: z.object({
    words: z.number().default(0),
    prompts: z.number().default(0),
    userId: z.string().optional(),
  }).optional(),
});

export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>;
