import { z } from 'zod';

export const ProviderSchema = z.enum(['gemini', 'claude', 'groq']);

export const ExecuteBodySchema = z.object({
  prompt:   z.string().min(1).max(20000),
  provider: ProviderSchema,
});

export const SuggestSubsBodySchema = z.object({
  category: z.string().min(1).max(100),
});

export const GenerateBodySchema = z.object({
  large_name:   z.string().min(1).max(500),
  medium_names: z.array(z.string().max(500)).max(50).optional().default([]),
  small_names:  z.array(z.string().max(500)).max(50).optional().default([]),
  userInput:    z.string().max(5000).optional().default(''),
  length:       z.number().int().nonnegative().optional().default(0),
  provider:     z.enum(['gemini', 'claude', 'groq', 'copy']),
});

export type ExecuteBody     = z.infer<typeof ExecuteBodySchema>;
export type SuggestSubsBody = z.infer<typeof SuggestSubsBodySchema>;
export type GenerateBody    = z.infer<typeof GenerateBodySchema>;
