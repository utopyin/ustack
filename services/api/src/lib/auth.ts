import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Context } from "hono";
import { Env } from "..";

export const auth = <E extends Env>(c: Context<E>) =>
	betterAuth({
		basePath: "/auth",
		baseURL: c.env.BASE_URL,
		plugins: [expo()],
		trustedOrigins: ["ustack://", c.env.ORIGIN],
		database: drizzleAdapter(c.var.db(), {
			provider: "pg",
			usePlural: true,
		}),
		socialProviders: {
			google: {
				clientId: c.env.GOOGLE_CLIENT_ID,
				clientSecret: c.env.GOOGLE_CLIENT_SECRET,
			},
		},
	});
