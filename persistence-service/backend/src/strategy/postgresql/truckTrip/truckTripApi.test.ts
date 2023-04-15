import axios from "axios";

describe("truck trip api", () => {
  it("returns hello world", async () => {
    const response = await axios.get("http://localhost:8000/truckTrip");

    expect(response).toBe("hello world, here are your truck trips.");
  });
});