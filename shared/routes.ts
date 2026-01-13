import { z } from "zod";
import { insertProfileSchema, insertLinkSchema, profiles, links } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  profiles: {
    me: {
      method: "GET" as const,
      path: "/api/profiles/me",
      responses: {
        200: z.custom<typeof profiles.$inferSelect & { links: typeof links.$inferSelect[] }>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    getBySlug: {
      method: "GET" as const,
      path: "/api/public/profiles/:slug",
      responses: {
        200: z.custom<typeof profiles.$inferSelect & { links: typeof links.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/profiles/me",
      input: insertProfileSchema.partial(),
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  links: {
    create: {
      method: "POST" as const,
      path: "/api/links",
      input: insertLinkSchema,
      responses: {
        201: z.custom<typeof links.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/links/:id",
      input: insertLinkSchema.partial(),
      responses: {
        200: z.custom<typeof links.$inferSelect>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/links/:id",
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
      },
    },
    reorder: {
      method: "POST" as const,
      path: "/api/links/reorder",
      input: z.object({ linkIds: z.array(z.number()) }),
      responses: {
        200: z.array(z.custom<typeof links.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}
