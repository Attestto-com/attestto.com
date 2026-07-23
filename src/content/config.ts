import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    author: z.string().default('Attestto'),
    tags: z.array(z.string()).default([]),
    canonicalUrl: z.string().url().optional(),
    lang: z.enum(['en', 'es']).default('en'),
    draft: z.boolean().default(false),
    heroImage: z.string().optional(),
  }),
});

const whitepaper = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    lang: z.enum(['en', 'es']).default('en'),
    // Absolute path to the self-hosted PDF in public/. User-provided file.
    pdf: z.string(),
    // Absolute path of the other-language version of this whitepaper, for hreflang.
    altHref: z.string(),
    ogImage: z.string().optional(),
    canonicalUrl: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, whitepaper };
