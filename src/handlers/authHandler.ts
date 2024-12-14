import type { Context } from "hono";
import { db } from "../db";
import { users } from "../db/schema/user";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken, verifyToken } from "../utils/token";
import { eq, or } from "drizzle-orm";
import { setCookie, deleteCookie } from 'hono/cookie';

export const authHandler = {
  async register(c: Context) {
    const { username, email, password } = await c.req.json();
    
    const existingUser = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .limit(1);
    
    if (existingUser.length > 0) {
      return c.json({ error: "User already exists" }, 409);
    }
    
    const hashedPassword = await hashPassword(password);
    
    const [newUser] = await db
      .insert(users)
      .values({ username, email, password: hashedPassword })
      .returning({ id: users.id, username: users.username, email: users.email });
    
    const token = generateToken(newUser.id);
    
    setCookie(c, "session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 1 week
    });
    
    return c.json({ user: newUser }, 201);
  },
  
  async login(c: Context) {
    const { username, email, password } = await c.req.json();
    
    const user = await db
      .select()
      .from(users)
      .where(email ? eq(users.email, email) : eq(users.username, username!))
      .limit(1);
    
    if (user.length === 0) {
      return c.json({ error: "Invalid credentials" }, 401);
    }
    
    const isPasswordValid = await comparePassword(password, user[0].password);
    
    if (!isPasswordValid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }
    
    const token = generateToken(user[0].id);
    
    setCookie(c, "session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 1 week
    });
    
    return c.json({
      user: {
        id: user[0].id,
        username: user[0].username,
        email: user[0].email,
      },
    }, 200);
  },
  
  async logout(c: Context) {
    deleteCookie(c, "session");
    return c.json({ message: "Logged out successfully" }, 200);
  },
  
  async forgotPassword(c: Context) {
    const { email } = await c.req.json();
    
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (user.length === 0) {
      return c.json({ message: "If the email exists, a reset link has been sent." }, 200);
    }
    
    const token = generateToken(user[0].id, "1h");
    
    // TODO: Send email with reset link
    console.log(`Reset link: ${process.env.FRONTEND_URL}/reset-password?token=${token}`);
    
    return c.json({ message: "If the email exists, a reset link has been sent." }, 200);
  },
  
  async resetPassword(c: Context) {
    const { token, password } = await c.req.json();
    
    try {
      const decoded = verifyToken(token);
      const hashedPassword = await hashPassword(password);
      
      await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, decoded.userId));
      
      return c.json({ message: "Password reset successfully" }, 200);
    } catch (error) {
      return c.json({ error: "Invalid or expired token" }, 400);
    }
  },
};