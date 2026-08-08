import "server-only";
import { CleanverseClient } from "./client";
import { getCleanverseConfig } from "./config";

export function getCleanverseClient() {
  const config = getCleanverseConfig();
  return new CleanverseClient({ baseUrl: config.CLEANVERSE_API_BASE_URL, apiId: config.CLEANVERSE_API_ID, apiKey: config.CLEANVERSE_API_KEY });
}
