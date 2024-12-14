// src/middleware/auth.ts
import type { Context, Next } from "hono";
import { verifyToken } from "../utils/token";
import { getCookie } from "hono/cookie";

export async function authMiddleware(c: Context, next: Next) {
  const token = getCookie(c, "session");

  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const decoded = verifyToken(token);
    c.set("userId", decoded.userId);
    await next();
  } catch (error) {
    return c.json({ error: "Unauthorized" }, 401);
  }
}