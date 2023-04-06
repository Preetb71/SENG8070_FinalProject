import axios from "axios";

describe("employee api", () => {
  it("returns hello world", async () => {
    const response = await axios.get("http://localhost:8000/employee");

    expect(response).toBe("hello world");
  });
});