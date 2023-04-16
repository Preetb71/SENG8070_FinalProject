import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();


const targetUrl = `${process.env.PHOTO_TARGET_URL}`;

describe("smoke", () => {
  it("persistence-service status is 200", async () => {
    // console.log(targetUrl);
    const health = await axios.get(`http://${targetUrl}`);
    // console.log(health.status);
    expect(health.status).toBe(200);
  });
});

