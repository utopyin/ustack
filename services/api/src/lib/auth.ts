import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Context } from "hono";
import { Env } from "..";

export const auth = <E extends Env>(c: Context<E>) =>
	betterAuth({
		trustedOrigins: ["ustack://"],
		database: drizzleAdapter(c.var.db(), {
			provider: "pg",
		}),
		emailAndPassword: {
			enabled: true,
		},
	});
