import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  dob: z.coerce.date().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  avatarId: z.string().uuid().optional(),
});

export const createAddressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone is required'),
  company: z.string().optional(),
  label: z.string().optional(),
  street: z.string().min(1),
  landmark: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  addressType: z.enum(['HOME', 'OFFICE', 'OTHER']).default('HOME'),
  deliveryInstructions: z.string().optional(),
  isBilling: z.boolean().default(false),
  isShipping: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();
