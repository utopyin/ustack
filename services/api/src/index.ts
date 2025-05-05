import type { db } from "@ustack/db";
import { Hono, Env as HonoEnv } from "hono";
import { getCookie } from "hono/cookie";
import { auth } from "./lib/auth";
import { baseMiddlewares } from "./middlewares/baseMiddlewares";
import { usersRoutes } from "./routes/users";

export interface Env extends HonoEnv {
	Bindings: {
		BETTER_AUTH_SECRET: string;
		DATABASE_URL: string;
		GOOGLE_CLIENT_ID: string;
		GOOGLE_CLIENT_SECRET: string;
		WORKER_ENV: "local" | "production";
		ORIGIN: string;
		BASE_URL: string;
	};
	Variables: {
		db: () => ReturnType<typeof db>;
	};
}

const app = new Hono<Env>()
	.use(...baseMiddlewares)
	.use(async (c, next) => {
		// console.log(c.req.raw.headers);
		console.log(getCookie(c));
		return await next();
		// return c.json(
		// 	{
		// 		message: "Hello, world!",
		// 	} as const,
		// 	200,
		// );
	})
	.on(["POST", "GET"], "/auth/*", (c) => {
		return auth(c).handler(c.req.raw);
	})
	.route("/users", usersRoutes);

export type App = typeof app;
export default app;
