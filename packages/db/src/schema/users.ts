import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { nanoid } from "../lib/nanoid";

export const users = pgTable("users", {
	id: text("id").primaryKey().$default(nanoid),
	name: text("name").notNull(),
	email: text("email").notNull(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const usersSchema = createSelectSchema(users);
