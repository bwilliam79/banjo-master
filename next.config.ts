import type { NextConfig } from "next";
import { execSync } from "child_process";

function git(cmd: string): string {
  try {
    return execSync(`git ${cmd}`, { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || "0.0.0",
    NEXT_PUBLIC_GIT_SHA: git("rev-parse --short HEAD"),
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().split("T")[0],
  },
};

export default nextConfig;
