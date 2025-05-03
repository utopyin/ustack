import type { db } from "@ustack/db";
import { Hono, Env as HonoEnv } from "hono";
import { auth } from "./lib/auth";
import { baseMiddlewares } from "./middlewares/baseMiddlewares";
import { usersRoutes } from "./routes/users";

export interface Env extends HonoEnv {
	Bindings: {
		BETTER_AUTH_SECRET: string;
		DATABASE_URL: string;
		WORKER_ENV: "local" | "production";
		ORIGIN: string;
	};
	Variables: {
		db: () => ReturnType<typeof db>;
	};
}

const app = new Hono<Env>()
	.use(...baseMiddlewares)
	.on(["POST", "GET"], "/auth/*", (c) => {
		return auth(c).handler(c.req.raw);
	})
	.route("/users", usersRoutes);

export type App = typeof app;
export default app;
