import { z } from 'zod';

export const authSchema = z.object({
  email: z.email(),
  password: z.string().min(5).max(12),
});

export const loginSchema = authSchema;

export const registerSchema = authSchema
  .extend({
    confirmPassword: z.string().min(5).max(12),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'auth.errors.validation',
    path: ['confirmPassword'],
  });

export type LoginValues = z.infer<typeof authSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
