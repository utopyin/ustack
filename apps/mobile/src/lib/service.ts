import { expoClient } from "@better-auth/expo/client";
import { createService } from "@ustack/service";
import * as SecureStore from "expo-secure-store";

export const service = createService({
	apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
	auth: {
		plugins: [
			expoClient({
				scheme: "ustack",
				storagePrefix: "ustack",
				storage: SecureStore,
			}),
		],
	},
	getCookie: (authClient) => authClient.getCookie(),
});
