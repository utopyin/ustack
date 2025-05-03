import { db } from "@ustack/db";
import { createMiddleware } from "hono/factory";
import type { Env } from "..";

export const setupDatabase = createMiddleware<Env>(async (c, next) => {
	c.set("db", () => db(c.env.DATABASE_URL));
	return next();
});
