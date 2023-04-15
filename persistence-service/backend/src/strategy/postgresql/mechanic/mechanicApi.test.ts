import axios from "axios";

describe("Mechanic api", () => {
  it("returns hello world", async () => {
    const response = await axios.get("http://localhost:8000/mechanic");

    expect(response).toBe("hello world, here are your mechanics.");
  });
});