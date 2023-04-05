/* currently not in use while using --cached-only */
const whitelistedLibraries: string[] = [
  "https://deno.land/std@0.171.0/http/server.ts",
  "https://deno.land/std@0.171.0/http/file_server.ts",
  "https://deno.land/std@0.171.0/fs/exists.ts",
  "https://deno.land/x/eta@v2.0.0/mod.ts",
  "https://deno.land/x/oak@v11.1.0/mod.ts",
  "https://deno.land/x/postgres@v0.17.0/mod.ts",
  "https://deno.land/x/bcrypt@v0.4.1/mod.ts",
  "https://deno.land/x/base64@v0.2.1/mod.ts",
  "https://deno.land/x/cors@v1.2.2/mod.ts",
  "https://deno.land/x/oak_sessions@v4.0.5/mod.ts",
  "https://deno.land/x/superoak@4.7.0/mod.ts",
  "https://deno.land/std@0.171.0/testing/asserts.ts",
  "https://deno.land/x/mock@0.12.1/mod.ts",
  "https://deno.land/x/test_suite@0.9.1/mod.ts",
  "https://deno.land/x/postgresjs@v3.3.3/mod.js",
  "https://deno.land/x/redis@v0.29.0/mod.ts",
];

export default whitelistedLibraries;
