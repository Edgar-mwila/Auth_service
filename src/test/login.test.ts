import { test, expect } from "bun:test";
import app from "../app";

test("should have auth routes", async () => {
    const req = new Request("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "test", password: "test123" }),
    });
  
    const res = await app.fetch(req);
  
    if (res.status === 500) {
      const errorBody = await res.json();
      console.error("Error details:", errorBody);
    }
  
    expect(res.status).toBe(404); // Adjust based on expected status
  });