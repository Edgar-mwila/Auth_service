import type { Context } from "hono";
import { db } from "../db";
import { users, oauthTokens } from "../db/schema/user";
import { generateToken } from "../utils/token";
import { oauthConfig } from "../config/oauth";
import { eq } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";

// Define valid OAuth providers
type OAuthProvider = keyof typeof oauthConfig;

export const oauthHandler = {
  async initiateOAuth(c: Context) {
    const provider = c.req.param("provider") as OAuthProvider;
    const config = oauthConfig[provider];

    if (!config) {
      return c.json({ error: "Invalid OAuth provider" }, 400);
    }

    const state = Math.random().toString(36).substring(7);
    setCookie(c, "oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax" });

    const authorizationUrl = `${config.authorizationUrl}?client_id=${
      config.clientId
    }&redirect_uri=${encodeURIComponent(
      config.redirectUri
    )}&response_type=code&scope=${encodeURIComponent(
      config.scope
    )}&state=${state}`;

    return c.redirect(authorizationUrl);
  },

  async handleOAuthCallback(c: Context) {
    const provider = c.req.param("provider") as OAuthProvider;
    const { code, state } = c.req.query();
    const storedState = getCookie(c, "oauth_state");

    if (state !== storedState) {
      return c.json({ error: "Invalid state" }, 400);
    }

    const config = oauthConfig[provider];

    if (!config) {
      return c.json({ error: "Invalid OAuth provider" }, 400);
    }

    try {
      const tokenResponse = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: config.redirectUri,
          client_id: config.clientId,
          client_secret: config.clientSecret,
        }),
      });

      const tokenData = await tokenResponse.json();

      const userInfoResponse = await fetch(config.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const userInfo = await userInfoResponse.json();

      let user = await db
        .select()
        .from(users)
        .where(eq(users.email, userInfo.email))
        .limit(1);

      if (user.length === 0) {
        user = await db
          .insert(users)
          .values({
            email: userInfo.email,
            username: userInfo.name || userInfo.email.split("@")[0],
            password: "", // OAuth users don't have a password
          })
          .returning();
      }

      await db.insert(oauthTokens).values({
        userId: user[0].id,
        provider,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      });

      const token = generateToken(user[0].id);

      setCookie(c, "session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 1 week
      });

      return c.redirect(`/`);
    } catch (error) {
      console.error("OAuth error:", error);
      return c.json({ error: "OAuth authentication failed" }, 500);
    }
  },
};
