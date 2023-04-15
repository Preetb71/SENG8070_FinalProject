import axios from "axios";

describe("customer api", () => {
  it("returns hello world", async () => {
    const response = await axios.get("http://localhost:8000/customer");

    expect(response).toBe("hello world, here are your customers.");
  });
});