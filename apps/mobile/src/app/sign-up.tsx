import { useState } from "react";
import { Button, TextInput, View } from "react-native";
import { authClient } from "../lib/service";

export default function App() {
	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");

	const handleSignUp = async () => {
		await authClient.signUp.email({
			email,
			password,
			name,
		});
	};

	return (
		<View>
			<TextInput placeholder="Name" value={name} onChangeText={setName} />
			<TextInput placeholder="Email" value={email} onChangeText={setEmail} />
			<TextInput
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
			/>
			<Button title="Sign Up" onPress={handleSignUp} />
		</View>
	);
}
