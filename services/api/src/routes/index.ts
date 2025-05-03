import { Hono } from "hono";
import { Env } from "..";
import { usersRoutes } from "./users";

export const routes = new Hono<Env>().route("/users", usersRoutes);
