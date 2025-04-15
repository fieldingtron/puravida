import { defineCollection, z } from "astro:content";

// Define the schema for the content collections
export const collections = {
  // Trips collection (MDX files)
  trips: defineCollection({
    type: "content",
    schema: z.object({
      title: z.string(),
      description: z.string().optional(),
      difficulty: z.string().optional(),
      duration: z.string().or(z.number()).optional(),
      price: z.string().or(z.number()).optional(),
      mainImg: z.string().optional(),
      images: z.array(z.string()).optional(),
      featured: z.boolean().optional(),
      order: z.number().optional(),
    }),
  }),

  // Testimonials collection with permissive schema
  testimonials: defineCollection({
    type: "data",
    schema: z.object({}), // Using an empty schema to allow any structure
  }),
};
