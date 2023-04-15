import axios from "axios";

describe("shipment api", () => {
  it("returns hello world", async () => {
    const response = await axios.get("http://localhost:8000/shipment");

    expect(response).toBe("hello world, here are your shipments.");
  });
});