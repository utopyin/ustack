import { useQuery } from "@tanstack/react-query";
import {
	APICallErrorType,
	APICallResultType,
	createAPICall,
	useRPCClient,
} from "./helpers";

export const createUsersService = useRPCClient((client) => {
	const getMeUser = createAPICall(client.users.me.$get);
	type getMeUserError = APICallErrorType<typeof client.users.me.$get>;
	type getMeUserResult = APICallResultType<typeof client.users.me.$get>;

	return {
		getMeUser,
		useUser: () => {
			const query = useQuery<getMeUserResult, getMeUserError>({
				queryKey: ["user", "me"],
				queryFn: async () => {
					const response = await getMeUser();
					if (response.isErr()) {
						return Promise.reject(response.error);
					}

					return response.value;
				},
			});
			return query;
		},
	} as const;
});
