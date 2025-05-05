import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Redirect, Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/src/hooks/useColorScheme";
import { service } from "../lib/service";

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const pathname = usePathname();
	const [loaded] = useFonts({
		SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
	});

	const { data: auth, isPending } = service.authClient.useSession();

	if (!loaded || isPending) {
		// Async font loading only occurs in development.
		return null;
	}

	if (auth == null && pathname !== "/sign-in" && pathname !== "/sign-up") {
		return <Redirect href="/sign-in" />;
	}

	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			<Stack>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen name="+not-found" />
				<Stack.Screen
					name="sign-in"
					options={{
						title: "Sign in",
						header: () => <Text>Sign in</Text>,
					}}
				/>
			</Stack>
			<StatusBar style="auto" />
		</ThemeProvider>
	);
}
