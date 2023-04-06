import axios from "axios";

const targetUrl = `${process.env.TARGET_URL}`;

describe("smoke", () => {
  it("persistence-service status is 200", async () => {
    console.log(targetUrl);
    const health = await axios.get(`http://${targetUrl}`);

    console.log(health.status);
    expect(health.status).toBe(200);
  });
});
