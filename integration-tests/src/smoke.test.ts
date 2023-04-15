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

const targetUrl1 = `${process.env.EMPLOYEE_TARGET_URL}`;

describe("Insert an Employee Test", () => {
  it("an employee is inserted", async () => {

    const response = await axios.post(`http://${targetUrl1}`,{firstName:'Heet', lastName:'Bhatt', seniority:'Junior', category:'driver'});
    expect(response.status).toBe(200);
    // expect(response.data.headers['firstName']).toBe('Heet');
  });
});

