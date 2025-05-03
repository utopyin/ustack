import { createMiddleware } from "hono/factory";
import { Env } from "..";
import { cors as honoCors } from "hono/cors";

export const cors = createMiddleware<Env>((c, next) => {
	return honoCors({
		origin: c.env.ORIGIN,
		credentials: true,
	})(c, next);
});
