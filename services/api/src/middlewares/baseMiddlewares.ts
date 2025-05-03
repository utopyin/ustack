import { cors } from "./cors";
import { setupDatabase } from "./setupDatabase";

export const baseMiddlewares = [cors, setupDatabase];
