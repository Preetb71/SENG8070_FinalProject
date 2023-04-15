import axios from "axios";

describe("employee category api", () => {
  it("returns hello world", async () => {
    const response = await axios.get("http://localhost:8000/employeeCategory");

    expect(response).toBe("hello world, here are your employee categories.");
  });
});