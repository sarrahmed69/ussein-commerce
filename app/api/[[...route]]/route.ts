import { Hono } from "hono";
import { handle } from "hono/vercel";
import { logger } from "hono/logger";
import auth from "./(modules)/auth/auth";
import users from "./(modules)/users/users";
import vendors from "./(modules)/vendors/vendors";
import waveRouter from "./(modules)/payments/wave";
import abonnementRouter from "./(modules)/abonnement/abonnement";
import orangeMoneyRouter from "./(modules)/payments/orange-money";

const app = new Hono().basePath("/api");
app.use("*", logger());

const routes = app
  .route("/auth", auth)
  .route("/users", users)
  .route("/vendors/abonnement", abonnementRouter)
  .route("/vendors", vendors)
  .route("/payments/wave", waveRouter)
  .route("/payments/orange-money", orangeMoneyRouter);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);

export type AppType = typeof routes;