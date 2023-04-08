import axios from "axios";

describe("Driver api", () => {
  it("returns hello world", async () => {
    const response = await axios.get("http://localhost:8000/driver");

    expect(response).toBe("hello world");
  });
});