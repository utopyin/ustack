import { App } from "@ustack/api";
import { ClientOptions } from "better-auth";
import { createAuthClient } from "better-auth/react";
import { hc } from "hono/client";
import { createUsersService } from "./users";

type AuthClientParameters = Omit<ClientOptions, "basePath">;

export const createService = <
	P extends AuthClientParameters,
	P2 extends P & { baseURL: string; basePath: string },
>({
	auth,
	apiUrl,
	getCookie,
}: {
	auth?: P;
	apiUrl: string;
	getCookie?: (authClient: ReturnType<typeof createAuthClient<P2>>) => string;
}) => {
	const authClient = createAuthClient({
		baseURL: apiUrl,
		basePath: "/auth",
		...auth,
	} as P2);

	const rpcClient = hc<App>(apiUrl, {
		init: {
			credentials: "include",
			headers: getCookie ? { Cookie: getCookie(authClient) } : undefined,
		},
	});

	return {
		authClient,
		rpcClient,
		...createUsersService(rpcClient),
	};
};
