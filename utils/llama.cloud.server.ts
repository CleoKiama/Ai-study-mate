import { env } from "@/utils/env.server";
import { LlamaCloudIndex } from "llama-cloud-services";

const cache: Map<string, LlamaCloudIndex> = new Map();

export default function llamaCloudServer() {
  if (cache.has("currentInstance")) return cache.get("currentInstance")!;
  const index = new LlamaCloudIndex({
    name: "cultural-cardinal-2025-09-28",
    projectName: "Default",
    organizationId: "a00c6942-433a-4ebc-afbb-823c7645681a",
    apiKey: env.LLAMA_API_KEY,
  });
  cache.set("currentInstance", index);
  return index;
}
