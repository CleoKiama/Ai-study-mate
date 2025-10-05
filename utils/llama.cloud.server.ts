// utils/llamaCloudServer.ts
import { env } from "@/utils/env.server";
import { LlamaCloudIndex } from "llama-cloud-services";
import { remember } from "@/utils/remember.server";

/**
 * Returns a cached instance of LlamaCloudIndex.
 * Automatically persists across hot reloads (thanks to `remember`).
 */
export const llamaCloudConfig = {
  name: "cultural-cardinal-2025-09-28",
  projectName: "Default",
  organizationId: "a00c6942-433a-4ebc-afbb-823c7645681a",
  apiKey: env.LLAMA_API_KEY,
};

export default function llamaCloudServer(): LlamaCloudIndex {
  return remember("LlamaCloudIndexInstance", () => {
    return new LlamaCloudIndex(llamaCloudConfig);
  });
}
