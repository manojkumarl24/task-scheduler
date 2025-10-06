import request from "supertest";
import app from "../src/app.js";

describe("GET /test", () => {
  it("should return 200", async () => {
    const res = await request(app).get("/test");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("status", "OK");
  });
});
