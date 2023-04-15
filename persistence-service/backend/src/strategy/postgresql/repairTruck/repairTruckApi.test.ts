import axios from "axios";

describe("repair truck api", () => {
  it("returns hello world", async () => {
    const response = await axios.get("http://localhost:8000/repairTruck");

    expect(response).toBe("hello world, here are your repair truck records.");
  });
});