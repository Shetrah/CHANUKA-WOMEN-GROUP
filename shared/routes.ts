import { z } from 'zod';
import { insertApprovedUserSchema, insertGbvReportSchema, approvedUsers, gbvReports } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// API Contract
// Note: Frontend will mostly use Firebase SDK directly, but we define these 
// for structure and potential server-side admin actions if needed.
export const api = {
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users',
      responses: {
        200: z.array(z.custom<typeof approvedUsers.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/users',
      input: insertApprovedUserSchema,
      responses: {
        201: z.custom<typeof approvedUsers.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/users/:id',
      input: insertApprovedUserSchema.partial(),
      responses: {
        200: z.custom<typeof approvedUsers.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  reports: {
    list: {
      method: 'GET' as const,
      path: '/api/reports',
      input: z.object({
        status: z.enum(['pending', 'reviewed', 'resolved']).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof gbvReports.$inferSelect>()),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/reports/:id',
      input: z.object({
        status: z.enum(['pending', 'reviewed', 'resolved']),
      }),
      responses: {
        200: z.custom<typeof gbvReports.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
