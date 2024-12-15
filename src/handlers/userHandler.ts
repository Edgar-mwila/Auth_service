// src/handlers/userHandler.ts
import type { Context } from "hono";
import { db } from "../db";
import { users } from "../db/schema/users";
import { eq } from "drizzle-orm";

export const userHandler = {
  async getProfile(c: Context) {
    const userId = c.get("userId");

    const user = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ user: user[0] }, 200);
  },

  async updateProfile(c: Context) {
    const userId = c.get("userId");
    const { username, email } = await c.req.json();

    const updatedUser = await db
      .update(users)
      .set({ username, email })
      .where(eq(users.id, userId))
      .returning({ id: users.id, username: users.username, email: users.email });

    return c.json({ user: updatedUser[0] }, 200);
  },
};