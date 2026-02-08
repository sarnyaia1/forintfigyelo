import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Az email cím kötelező')
    .email('Érvénytelen email cím'),
  password: z
    .string()
    .min(1, 'A jelszó kötelező')
    .min(8, 'A jelszónak legalább 8 karakter hosszúnak kell lennie'),
})

export const registerSchema = z
  .object({
    name: z.string().min(1, 'A név kötelező').max(100, 'A név túl hosszú'),
    email: z
      .string()
      .min(1, 'Az email cím kötelező')
      .email('Érvénytelen email cím'),
    password: z
      .string()
      .min(8, 'A jelszónak legalább 8 karakter hosszúnak kell lennie')
      .regex(/[A-Z]/, 'A jelszónak tartalmaznia kell legalább egy nagybetűt')
      .regex(/[0-9]/, 'A jelszónak tartalmaznia kell legalább egy számot'),
    confirmPassword: z.string().min(1, 'A jelszó megerősítése kötelező'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'A jelszavak nem egyeznek',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Az email cím kötelező')
    .email('Érvénytelen email cím'),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'A jelszónak legalább 8 karakter hosszúnak kell lennie')
      .regex(/[A-Z]/, 'A jelszónak tartalmaznia kell legalább egy nagybetűt')
      .regex(/[0-9]/, 'A jelszónak tartalmaznia kell legalább egy számot'),
    confirmPassword: z.string().min(1, 'A jelszó megerősítése kötelező'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'A jelszavak nem egyeznek',
    path: ['confirmPassword'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
