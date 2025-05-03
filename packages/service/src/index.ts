import { isServer } from "@tanstack/react-query";
import { getHeader } from "@tanstack/react-start/server";
import type { App } from "@ustack/api";
import { type ClientResponse, type InferResponseType, hc } from "hono/client";
import type {
	ClientErrorStatusCode,
	StatusCode as HonoStatusCode,
	InfoStatusCode,
	ServerErrorStatusCode,
	StatusCode,
	SuccessStatusCode,
} from "hono/utils/http-status";
import { type Result, err, ok } from "neverthrow";
import { APIError } from "./error";

const apiUrl = import.meta.env.VITE_API_URL ?? process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
	throw new Error("The API URL has not been set in the environment variables.");
}

export const client = hc<App>(apiUrl);

export const createAPICall = <
	StatusCode extends HonoStatusCode,
	RemoteFunction extends (
		// biome-ignore lint/suspicious/noExplicitAny: can be literally anything
		...args: any
		// biome-ignore lint/suspicious/noExplicitAny: can be literally anything
	) => Promise<ClientResponse<any, StatusCode, "json">>,
>(
	apiCall: RemoteFunction,
): ((...args: Parameters<RemoteFunction>) => Promise<
	Result<
		InferResponseType<RemoteFunction, 200>,
		| APIError<
				InferResponseType<
					RemoteFunction,
					ClientErrorStatusCode | ServerErrorStatusCode
				>["code"]
		  >
		| APIError
		// we add it manually because the rpc client won't be able to infer it as it comes from a middleware
		// https://github.com/honojs/hono/issues/2719
		| APIError<"UNAUTHORIZED">
	>
>) => {
	return async (...args: Parameters<RemoteFunction>) => {
		const headers = new Headers(args[1]?.headers ?? {});
		if (isServer) {
			// when running on the server, we need to pass the cookie to the api service
			const cookie = getHeader("Cookie");
			if (cookie) headers.set("Cookie", cookie);
		}
		const response = await apiCall(args[0], {
			...args[1],
			init: { credentials: "include" },
			headers,
		});
		try {
			const json = await response.json();
			if (!response.ok) {
				return err(APIError.fromApiError(json));
			}
			return ok(json);
		} catch (error) {
			if (response.ok) {
				return err(
					new APIError({
						message: "Unexpected response format.",
						statusCode: 500,
					}),
				);
			}
			return err(APIError.fromHttpError(response));
		}
	};
};

export type APICallErrorType<
	RemoteFunction extends (
		// biome-ignore lint/suspicious/noExplicitAny: can be literally anything
		...args: any
		// biome-ignore lint/suspicious/noExplicitAny: can be literally anything
	) => Promise<ClientResponse<any, StatusCode, "json">>,
> =
	| APIError<
			InferResponseType<
				RemoteFunction,
				ClientErrorStatusCode | ServerErrorStatusCode
			>["code"]
	  >
	| APIError
	| APIError<"UNAUTHORIZED">;

export type APICallResultType<
	RemoteFunction extends (
		// biome-ignore lint/suspicious/noExplicitAny: can be literally anything
		...args: any
		// biome-ignore lint/suspicious/noExplicitAny: can be literally anything
	) => Promise<ClientResponse<any, StatusCode, "json">>,
> = InferResponseType<RemoteFunction, InfoStatusCode | SuccessStatusCode>;

export * from "./error";
export * from "./users";
