import { z } from 'zod';

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72;
const EMAIL_MAX = 254;

export const registerUserSchema = z.object({
  name: z
    .string({ error: 'Name must be a string' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(250, 'Name cannot contain more than 250 characters'),

  email: z
    .email({ error: 'A valid email address is required' })
    .trim()
    .toLowerCase()
    .max(EMAIL_MAX, 'Email is too long'),

  password: z
    .string({ error: 'Password must be a string' })
    .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
    .max(PASSWORD_MAX, `Password cannot exceed ${PASSWORD_MAX} characters`)
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/~`;']/, 'Password must contain at least one special character'),
});

export const userLoginSchema = z.object({
  email: z
    .email({ error: 'A valid email address is required' })
    .trim()
    .toLowerCase()
    .max(EMAIL_MAX, 'Email is too long'),

  password: z
    .string({ error: 'Password must be a string' })
    .min(1, 'Password is required')
    .max(PASSWORD_MAX, 'Password is too long'),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;