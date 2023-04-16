import axios from "axios";
import { log } from "console";
import dotenv from 'dotenv';
dotenv.config();

const resetDbUrl = `${process.env.RESETDATABASE_TARGET_URL}`;
const postemployeeUrl = `${process.env.EMPLOYEE_TARGET_URL}`;
const getemployeeUrl = `${process.env.EMPLOYEE_TARGET_URL}/1`;

//Resets the database before running tests. Imp to run tests on a clean environment.
beforeAll(async()=>{
    const res = await axios.get(`http://${resetDbUrl}`);
});


describe("Employee Integration Test", () => {
    it("inserts employee into the database", async () => {
      const response = await axios.post(`http://${postemployeeUrl}`,{firstName:"Preet",lastName:"Bhatt", seniority:"Intermediate",category:"mechanic"});
      expect(response.data.firstName).toBe("Preet");
      expect(response.data.lastName).toBe("Bhatt");
      expect(response.data.seniority).toBe("Intermediate");
      expect(response.data.category).toBe("mechanic");
      expect(response.data.success).toBe("Employee successfully added.");
      expect(response.status).toBe(200);
      // console.log(`Employee ${response.data.employeeId} successfully added.`);
    });
  });

  describe("Employee Integration Test", () => {
    it("gets an employee from the database", async () => {
      const response = await axios.get(`http://${getemployeeUrl}`);
      expect(response.data.employeeId).toBe(1);
      expect(response.data.employeeFirstName).toBe("Preet");
      expect(response.data.employeeLastName).toBe("Bhatt");
      expect(response.data.employeeSeniority).toBe("Intermediate");
      expect(response.data.employeeCategory).toBe("mechanic");
      expect(response.status).toBe(200);
      // console.log(`Employee ${response.data.employeeId} successfully fetched.`);
    });
  });

  describe("Employee Integration Test", () => {
    it("updates the employee with given id in the database", async () => {
      const response = await axios.put(`http://${getemployeeUrl}`,{firstName:"Adam",lastName:"Brenner",seniority:"junior", category:"driver"});
      expect(response.data.employeeId).toBe(1);
      expect(response.data.employeeFirstName).toBe("Adam");
      expect(response.data.employeeLastName).toBe("Brenner");
      expect(response.data.employeeSeniority).toBe("junior");
      expect(response.data.employeeCategory).toBe("driver");
      expect(response.status).toBe(200);
      // console.log(`Employee ${response.data.employeeId} successfully updated.`);
    });
  });

  describe("Employee Integration Test", () => {
    it("deletes the employee with given id in the database", async () => {
      const response = await axios.delete(`http://${getemployeeUrl}`);
      expect(response.status).toBe(200);
      expect(response.data.success).toBe("Employee and its associated entities successfully removed from the db.");
      // console.log(`Employee ${response.data.employeeId} successfully updated.`);
    });
  });