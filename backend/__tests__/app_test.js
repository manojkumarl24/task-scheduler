import request from "supertest";
import app from "../src/app.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });
import {issueToken} from "../src/services/authService.js"
import * as userService from "../src/services/userService.js";


const mockToken = jwt.sign({ id: 1, username: "testuser" }, process.env.JWT_SECRET || "secretkey", { expiresIn: "1h" });

let realToken;

beforeAll(async () => {
    testUser = await userService.createUser({
      username: process.env.TEST_USERNAME,
      password: process.env.TEST_PASSWORD,
      role: "user",
    });

    realToken = issueToken(testUser);
});

afterAll(async () => {
  await userService.deleteUser(testUser.id);
});


describe("API & Auth Tests", () => {
  it("should return 200 and OK from /test", async () => {
    const res = await request(app).get("/test");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("status", "OK");
  });

  it("should respond with 400 if login data is missing", async () => {
    const res = await request(app).post("/auth/login").send({});
    expect(res.statusCode).toBe(400);
  });

  it("should deny access to /users route without token", async () => {
    const res = await request(app).get("/tasks");
    expect(res.statusCode).toBe(401);
  });

  it("should deny access to /users route with mock JWT", async () => {
    const res = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${mockToken}`);
    expect(res.statusCode).toBe(401);
  });

  it("should allow access to /users route with real test user JWT", async () => {
    const res = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${realToken}`);
    expect([200, 404]).toContain(res.statusCode);
  });

  it("should deny user info from /me with mock token", async () => {
    const res = await request(app)
      .get("/me")
      .set("Authorization", `Bearer ${mockToken}`);
    expect(res.statusCode).toBe(401);
  });

  it("should return user info from /me with real token", async () => {
    const res = await request(app)
      .get("/me")
      .set("Authorization", `Bearer ${realToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.username).toBe(process.env.TEST_USERNAME);
  });
});