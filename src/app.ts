import configureOpenAPI from "../configure-open-api";
import createApp from "./libs/create-app";
import { authRoutes } from "./routes/auth";
import { oauthRoutes } from "./routes/oauth";
import { userRoutes } from "./routes/user";
import { errorHandler } from "./middleware/errorHandler";

const app = createApp();
// Middleware
app.use("*", errorHandler);

// Routes
const authRouter = app.route("/auth", authRoutes);
const OauthRouter = app.route("/oauth", oauthRoutes);
const userRouer = app.route("/user", userRoutes);

const routes = [
    OauthRouter,
    userRouer,
    authRouter
] as const;

routes.forEach((route) => {
  app.route("/api", route);
});

export type AppType = typeof routes[number];

export default app;