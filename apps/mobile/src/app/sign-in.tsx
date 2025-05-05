import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, TextInput, View } from "react-native";
import { service } from "../lib/service";

export default function App() {
	const router = useRouter();
	const { data: auth, isPending } = service.authClient.useSession();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = async () => {
		await service.authClient.signIn.social({
			provider: "google",
			requestSignUp: true,
			callbackURL: "/explore",
		});
	};

	console.log("auth", auth);
	if (!isPending && auth !== null) {
		router.replace("/explore");
	}

	return (
		<View>
			<TextInput placeholder="Email" value={email} onChangeText={setEmail} />
			<TextInput
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
			/>
			<Button title="Login" onPress={handleLogin} />
		</View>
	);
}
