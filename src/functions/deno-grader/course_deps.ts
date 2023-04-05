import * as asserts from "https://deno.land/std@0.171.0/testing/asserts.ts";
import { serve } from "https://deno.land/std@0.171.0/http/server.ts";
import * as fs from "https://deno.land/std@0.171.0/fs/mod.ts";
import { serveFile } from "https://deno.land/std@0.171.0/http/file_server.ts";

import axiod from "https://deno.land/x/axiod@0.24/mod.ts";
import * as oak from "https://deno.land/x/oak@v11.1.0/mod.ts";
import * as content_type from "https://deno.land/x/content_type@1.0.1/mod.ts";
import * as media_types from "https://deno.land/x/media_types@v2.11.1/mod.ts";
import * as media_typer from "https://deno.land/x/media_typer@1.0.1/mod.ts";
import * as superoak from "https://deno.land/x/superoak@4.7.0/mod.ts";
import { Client, Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import postgres from "https://deno.land/x/postgresjs@v3.3.3/mod.js";

import * as evt from "https://deno.land/x/evt@v1.10.2/mod.ts";

import * as base64 from "https://deno.land/x/base64@v0.2.1/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import * as bcryptWorker from "https://deno.land/x/bcrypt@v0.4.1/src/worker.ts";
import * as validasaur from "https://deno.land/x/validasaur@v0.15.0/mod.ts";
import * as dom_parser from "https://deno.land/x/deno_dom@v0.1.15-alpha/deno-dom-wasm.ts";
import * as oak_cors from "https://deno.land/x/cors@v1.2.2/mod.ts";
import * as eta from "https://deno.land/x/eta@v2.0.0/mod.ts";
import * as metch from "https://deno.land/x/metch@0.1.0/mod.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { Session } from "https://deno.land/x/oak_sessions@v4.0.5/mod.ts";