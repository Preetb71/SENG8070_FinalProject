import axios from "axios";

describe("truck api", () => {
  it("returns hello world", async () => {
    const response = await axios.get("http://localhost:8000/truck");

    expect(response).toBe("hello world, here are your trucks.");
  });
});