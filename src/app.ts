import configureOpenAPI from "../configure-open-api";
import createApp from "./libs/create-app";
import { authRoutes } from "./routes/auth";
import { oauthRoutes } from "./routes/oauth";
import { userRoutes } from "./routes/user";
import { errorHandler } from "./middleware/errorHandler";

const app = createApp();

configureOpenAPI(app);
// Middleware
app.use("*", errorHandler);

// Routes
app.route("/auth", authRoutes);
app.route("/oauth", oauthRoutes);
app.route("/user", userRoutes);

export type AppType = typeof app;

export default app;