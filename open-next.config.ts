import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Mock mode needs no bindings: there is no database or cache service to attach.
export default defineCloudflareConfig();
