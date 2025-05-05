import { createService } from "@ustack/service";

export const service = createService({
	apiUrl: import.meta.env.VITE_API_URL,
});
