import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export const db = (url: string) => drizzle({ client: neon(url), schema });

export * as schema from "./schema";
