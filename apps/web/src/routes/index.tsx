import { createFileRoute } from "@tanstack/react-router";
import { useUser } from "@ustack/service";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	const { data, error } = useUser();

	console.log(data, error);
	return (
		<div className="p-2">
			<h3>Welcome Home!!!</h3>
		</div>
	);
}
