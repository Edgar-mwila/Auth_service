import { describe, test, expect } from "bun:test";
import app from "../app"; 

describe("App Routes", () => {
  test("should have auth routes", async () => {
    const req = new Request("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "securePassword"
      })
    });

    const res = await app.fetch(req);
    
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("user");
    expect(body.user).toHaveProperty("email", "test@example.com");
  });

  test("should handle invalid login credentials in auth routes", async () => {
    const req = new Request("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "invalid@example.com",
        password: "wrongPassword"
      })
    });

    const res = await app.fetch(req);
    
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty("error", "Invalid credentials");
  });

  test("should have oauth routes", async () => {
    const req = new Request("http://localhost:3000/oauth/providers");

    const res = await app.fetch(req);
    
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("providers");
    expect(body.providers).toContain("google");
  });

  test("should have user routes", async () => {
    const req = new Request("http://localhost:3000/user/profile", {
      headers: {
        "Authorization": "Bearer valid_token"
      }
    });

    const res = await app.fetch(req);
    
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("user");
    expect(body.user).toHaveProperty("username");
  });

  test("should handle unauthorized access to user routes", async () => {
    const req = new Request("http://localhost:3000/user/profile");

    const res = await app.fetch(req);
    
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty("error", "Unauthorized");
  });
});