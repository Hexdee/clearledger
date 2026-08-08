import { z } from "zod";

const configSchema = z.object({
  CLEANVERSE_API_BASE_URL: z.string().url().default("https://uatapi.cleanverse.com/api/cooperate"),
  CLEANVERSE_API_ID: z.string().min(1),
  CLEANVERSE_API_KEY: z.string().min(1),
  CLEANVERSE_CHAIN: z.string().default("monad"),
  CLEANVERSE_ATOKEN_ADDRESS: z.string().optional(),
});

export type CleanverseConfig = z.infer<typeof configSchema>;

export function getCleanverseConfig(): CleanverseConfig {
  return configSchema.parse(process.env);
}
