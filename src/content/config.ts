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

export const collections = { blog };
