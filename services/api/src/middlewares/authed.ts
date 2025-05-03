import { createMiddleware } from "hono/factory";
import { Env } from "..";
import { auth } from "../lib/auth";

type Auth = ReturnType<typeof auth>;

// https://github.com/honojs/hono/issues/2719
export const authed = createMiddleware<
	Env & {
		Variables: {
			user: Auth["$Infer"]["Session"]["user"] | null;
			session: Auth["$Infer"]["Session"]["session"] | null;
		};
	}
>(async (c, next) => {
	const session = await auth(c).api.getSession({ headers: c.req.raw.headers });

	if (!session) {
		return c.json({ CODE: "UNAUTHORIZED" } as const, 401);
	}

	c.set("user", session.user);
	c.set("session", session.session);

	await next();
});
