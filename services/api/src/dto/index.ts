import type { schema } from "@ustack/db";
import type { z } from "zod";

export const getUserDTO = (user: z.infer<typeof schema.usersSchema>) => ({
	id: user.id,
	name: user.name,
	email: user.email,
	emailVerified: user.emailVerified,
	image: user.image,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
});

export const getSessionDTO = (
	session: z.infer<typeof schema.sessionsSchema>,
) => ({
	id: session.id,
	userId: session.userId,
	expiresAt: session.expiresAt,
	ipAddress: session.ipAddress,
	userAgent: session.userAgent,
	createdAt: session.createdAt,
	updatedAt: session.updatedAt,
});

export const getVerificationDTO = (
	verification: z.infer<typeof schema.verificationsSchema>,
) => ({
	identifier: verification.identifier,
	value: verification.value,
	expiresAt: verification.expiresAt,
	createdAt: verification.createdAt,
	updatedAt: verification.updatedAt,
});
export type UserDTO = ReturnType<typeof getUserDTO>;
