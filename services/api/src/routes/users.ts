import { schema } from "@ustack/db";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { Env } from "..";
import { getUserDTO } from "../dto";
import { authed } from "../middlewares/authed";

export const usersRoutes = new Hono<Env>().get("/me", authed, async (c) => {
	const db = c.var.db();
	const { id } = c.get("user");

	const user = await db.query.users.findFirst({
		where: eq(schema.users.id, id),
	});

	if (!user) {
		return c.json({ code: "USER_NOT_FOUND" } as const, 404);
	}

	return c.json(getUserDTO(user), 200);
});
