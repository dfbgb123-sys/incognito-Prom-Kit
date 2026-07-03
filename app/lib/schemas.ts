import { z } from 'zod';

export const ProviderSchema = z.enum(['gemini', 'claude', 'groq']);

export const ExecuteBodySchema = z.object({
  prompt:   z.string().min(1),
  provider: ProviderSchema,
});

export const SuggestSubsBodySchema = z.object({
  category: z.string().min(1),
});

export const GenerateBodySchema = z.object({
  large_name:   z.string().min(1),
  medium_names: z.array(z.string()).optional().default([]),
  small_names:  z.array(z.string()).optional().default([]),
  userInput:    z.string().optional().default(''),
  length:       z.number().int().nonnegative().optional().default(0),
  provider:     z.string().min(1),
});

export type ExecuteBody     = z.infer<typeof ExecuteBodySchema>;
export type SuggestSubsBody = z.infer<typeof SuggestSubsBodySchema>;
export type GenerateBody    = z.infer<typeof GenerateBodySchema>;
