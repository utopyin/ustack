import * as prompts from "@clack/prompts";
import { $ } from "bun";
import kleur from "kleur";
import { randomBytes } from "node:crypto";
import { constants, copyFile, writeFile } from "node:fs/promises";
const { log: l } = console;

try {
	// projectName = await prompts.text({
	// 	message: "How should the project be named?",
	// });

	// if (prompts.isCancel(projectName)) {
	// 	await deleteTemplate();
	// 	process.exit(0);
	// }

	// const toggledApps = await prompts.multiselect({
	// 	message: "Toggle the apps you want to create",
	// 	options: [{ value: "Web" }, { value: "Mobile" }],
	// });

	// if (isCancelled(toggledApps)) {
	// 	process.exit(0);
	// }

	const isNeonConfirmed = await prompts.confirm({
		message: "Do you want to setup neon?",
		initialValue: true,
	});

	let dbUrl = "";
	if (isNeonConfirmed) {
		dbUrl = await setupNeon();
	}

	await createEnvFiles({ dbUrl });
} catch (error) {
	if (error instanceof $.ShellError) {
		l(error.stderr);
		process.exit(0);
	}
	if (isCancelled(error)) {
		process.exit(0);
	}
	console.log("error", error);
}

function isCancelled(value: unknown): value is symbol {
	if (prompts.isCancel(value)) {
		// const shouldDelete = await prompts.confirm({
		// 	message: `Should ${projectName.toString()} be deleted?`,
		// });

		// if (prompts.isCancel(shouldDelete)) {
		// 	return true
		// }
		return true;
	}
	return false;
}

async function deleteTemplate() {
	console.log("should delete", process.cwd());
	// rm(process.cwd(), { recursive: true, force: true });
}

async function createEnvFiles({ dbUrl }: { dbUrl: string }) {
	for (const dir of ["./apps/mobile/", "./apps/web/"]) {
		await copyFile(
			`${dir}/.env.example`,
			`${dir}/.env.development.local`,
			constants.COPYFILE_EXCL,
		).catch((error) => {
			console.log(error.message);
		});
	}

	await writeFile(
		`./packages/db/.env.development.local`,
		`DATABASE_URL=${dbUrl}`,
		{ flag: "wx" },
	).catch((error) => {
		console.log(error.message);
	});

	const secret = randomBytes(32).toString("hex");

	await writeFile(
		`./services/api/.dev.vars`,
		`BETTER_AUTH_SECRET=${secret}\rDATABASE_URL=${dbUrl}`,
		{ flag: "wx" },
	).catch((error) => {
		console.log(error.message);
	});
}

// --- NEON ---

interface NeonProject {
	id: string;
	name: string;
	region_id: string;
}

interface NeonBranch {
	id: string;
	name: string;
}

interface NeonDatabase {
	id: string;
	name: string;
}

async function setupNeon() {
	const projectId = await selectOrCreateProject();
	const branchId = await selectOrCreateBranch(projectId);
	const databaseName = await selectOrCreateDatabase(projectId, branchId);

	const spinner = prompts.spinner();

	spinner.start("Fetching connection string...");
	const connectionString =
		await $`neon connection-string ${branchId} --project-id=${projectId} --database-name=${databaseName} --pooled`.text();

	spinner.stop("Connection string added to environment files");

	l(kleur.green().bold("Neon has been setup"));

	return connectionString;
}

async function fetchProjects() {
	const spinner = prompts.spinner();

	spinner.start("Fetching projects...");
	const { projects } = await $`neon projects list --output=json`.json();
	spinner.stop("Projects have been fetched.");

	return projects as NeonProject[];
}

async function fetchBranches(projectId: string) {
	const spinner = prompts.spinner();

	spinner.start("Fetching branches...");
	const branches =
		await $`neon branches list --project-id=${projectId} --output=json`.json();
	spinner.stop("Branches have been fetched.");

	return branches as NeonBranch[];
}

async function fetchDatabases(projectId: string, branchId: string) {
	const databases =
		await $`neon db list --project-id=${projectId} --branch=${branchId} --output=json`.json();

	return databases as NeonDatabase[];
}

async function selectOrCreateProject() {
	const projects = await fetchProjects();
	let selectedProjectId = await prompts.select<string | symbol>({
		message: "Select a project",
		options: [
			{ label: "Create a new project", value: "create" },
			...projects.map((project) => ({
				label: project.name,
				hint: project.region_id,
				value: project.id,
			})),
		],
	});

	if (isCancelled(selectedProjectId)) {
		process.exit(0);
	}

	if (selectedProjectId === "create") {
		selectedProjectId = await createProject();
	}

	return selectedProjectId;
}

async function selectOrCreateBranch(projectId: string) {
	const branches = await fetchBranches(projectId);

	let selectedBranchId = await prompts.select<string>({
		message: "Select a branch",
		options: [
			{ label: "Create a new branch", value: "create" },
			...branches.map((branch) => ({
				label: branch.name,
				value: branch.id,
			})),
		],
	});

	if (isCancelled(selectedBranchId)) {
		process.exit(0);
	}

	if (selectedBranchId === "create") {
		selectedBranchId = await createBranch(projectId);
	}

	return selectedBranchId;
}

async function selectOrCreateDatabase(projectId: string, branchId: string) {
	const spinner = prompts.spinner();

	spinner.start("Fetching databases...");
	let databases: NeonDatabase[];
	try {
		databases = await fetchDatabases(projectId, branchId);
		spinner.stop("Databases have been fetched.");
	} catch (error) {
		spinner.stop(kleur.red("Failed to fetch databases."));
		l(error instanceof $.ShellError ? error.stderr : error);
		process.exit(1);
	}

	let selectedDatabaseName = await prompts.select<string>({
		message: "Select a database",
		options: [
			{ label: "Create a new database", value: "create" },
			...databases.map((database) => ({
				value: database.name,
			})),
		],
	});

	if (isCancelled(selectedDatabaseName)) {
		process.exit(0);
	}

	if (selectedDatabaseName === "create") {
		selectedDatabaseName = await createDatabase(projectId, branchId);
	}

	return selectedDatabaseName;
}

async function createProject() {
	const spinner = prompts.spinner();
	const newProjectName = await prompts.text({
		message: "Enter a name for the new project",
		validate: (value) =>
			value.length === 0 ? `Name cannot be empty!` : undefined,
	});

	if (isCancelled(newProjectName)) {
		process.exit(0);
	}

	spinner.start(
		`Creating project ${kleur.green(newProjectName.toString())}...`,
	);

	try {
		const { project } =
			await $`neon projects create --name=${newProjectName} --output=json`.json();
		spinner.stop(
			`Project ${kleur.green(newProjectName.toString())} has been created.`,
		);
		return project.id as string;
	} catch (error) {
		spinner.stop(kleur.red("Failed to create project."));
		l(error instanceof $.ShellError ? error.stderr : error);
		process.exit(1);
	}
}

async function createBranch(projectId: string) {
	const spinner = prompts.spinner();
	const newBranchName = await prompts.text({
		message: "Enter a name for the new branch",
		validate: (value) =>
			value.length === 0 ? `Name cannot be empty!` : undefined,
	});

	if (isCancelled(newBranchName)) {
		process.exit(0);
	}

	spinner.start(`Creating branch ${kleur.green(newBranchName.toString())}...`);

	try {
		const { branch } =
			await $`neon branches create --project-id=${projectId} --name=${newBranchName} -o json`.json();
		spinner.stop(
			`Branch ${kleur.green(newBranchName.toString())} has been created.`,
		);
		return branch.id as string;
	} catch (error) {
		spinner.stop(kleur.red("Failed to create branch."));
		l(error instanceof $.ShellError ? error.stderr : error);
		process.exit(1);
	}
}

async function createDatabase(projectId: string, branchId: string) {
	const spinner = prompts.spinner();
	const newDatabaseName = await prompts.text({
		message: "Enter a name for the new database",
		validate: (value) =>
			value.length === 0 ? `Name cannot be empty!` : undefined,
	});

	if (isCancelled(newDatabaseName)) {
		process.exit(0);
	}

	spinner.start(
		`Creating database ${kleur.green(newDatabaseName.toString())}...`,
	);

	try {
		const database =
			await $`neon db create --project-id=${projectId} --name=${newDatabaseName} --branch=${branchId} -o json`.json();
		spinner.stop(
			`Database ${kleur.green(newDatabaseName.toString())} has been created.`,
		);
		return database.name;
	} catch (error) {
		spinner.stop(kleur.red("Failed to create database."));
		l(error instanceof $.ShellError ? error.stderr : error);
		process.exit(1);
	}
}
