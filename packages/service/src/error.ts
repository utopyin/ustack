import type { ClientResponse } from "hono/client";
import type { StatusCode as HonoStatusCode } from "hono/utils/http-status";

export class APIError<TCode extends string = never> extends Error {
	public statusCode?: HonoStatusCode;
	public apiCode?: TCode;

	constructor({
		message,
		statusCode,
		apiCode,
	}: {
		message: string;
		statusCode?: HonoStatusCode;
		apiCode?: TCode;
	}) {
		super(message);
		this.message = message;
		this.statusCode = statusCode;
		this.apiCode = apiCode;
	}

	static fromHttpError<StatusCode extends HonoStatusCode>(
		response: ClientResponse<unknown, StatusCode>,
	) {
		return new APIError({
			message: response.statusText,
			statusCode: response.status,
		});
	}

	static fromApiError<TCode extends string>({
		code,
		message,
		statusCode,
	}: {
		code: TCode;
		message: string;
		statusCode: HonoStatusCode;
	}) {
		return new APIError<TCode>({
			message: message ?? `Error: ${code}`,
			apiCode: code,
			statusCode,
		});
	}
}
