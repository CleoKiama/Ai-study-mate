import { fileURLToPath } from "node:url";
import createJiti from "jiti";
import type { NextConfig } from "next";

const jiti = createJiti(fileURLToPath(import.meta.url));

jiti("./utils/env.server.ts");

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
