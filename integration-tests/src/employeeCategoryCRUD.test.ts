import axios from "axios";
import { log } from "console";
import dotenv from 'dotenv';
dotenv.config();

const resetDbUrl = `${process.env.RESETDATABASE_TARGET_URL}`;
const postemployeeUrl = `${process.env.EMPLOYEE_TARGET_URL}`;
const getemployeeCategoryUrl = `${process.env.EMPLOYEE_CATEGORY_TARGET_URL}/1`;

//Resets the database before running tests. Imp to run tests on a clean environment.
beforeAll(async()=>{
    const res = await axios.get(`http://${resetDbUrl}`);
});


//WHEN A EMPLOYEE IS CREATED, THE EMPLOYEE CATEGORY IS AUTOMATICALLY CREATED TOO
describe("Employee Category Integration Test", () => {
    it("inserts employee into the database to create employee category and insert into database", async () => {
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

//NOW WE WILL CHECK IF EMPLOYEE CATEGORY HAS BEEN CREATED OR NOT
describe("Employee Category Integration Test", () => {
    it("fetches employee category from db and checks if it has been created successfully", async () => {
      const response = await axios.get(`http://${getemployeeCategoryUrl}`);
      expect(response.data.employeeId).toBe(1);
      expect(response.data.employeeFirstName).toBe("Preet");
      expect(response.data.employeeLastName).toBe("Bhatt");
      expect(response.data.employeeCategory).toBe("mechanic");
      expect(response.status).toBe(200);
      // console.log(`Employee ${response.data.employeeId} successfully added.`);
    });
  });

//NOW WE WILL UPDATE EMPLOYEE CATEGORY
describe("Employee Category Integration Test", () => {
    it("updates the employee category in db.", async () => {
      const response = await axios.put(`http://${getemployeeCategoryUrl}`,{category:"driver"});

      expect(response.data.success).toBe("Employee Category and its associated entities updated successfully.");
      expect(response.data.employeeId).toBe(1);
      expect(response.data.employeeCategoryId).toBe(1);
      expect(response.data.employeeCategory).toBe("driver");
      expect(response.status).toBe(200);
      // console.log(`Employee ${response.data.employeeId} successfully added.`);
    });
  });

//NOW WE WILL DELETE EMPLOYEE CATEGORY
describe("Employee Category Integration Test", () => {
    it("deletes the employee category in db.", async () => {
      const response = await axios.delete(`http://${getemployeeCategoryUrl}`);
      expect(response.data.success).toBe("Employee Category and its associated entities removed successfully.");

    //   //THIS WILL TEST IF THE RIGHT ERROR WAS THROWN WHEN THE DELETED EMPLOYEE CATEGORY HAS BEEN TRIED TO FETCH.
    //   const response1 = await axios.get(`http://${getemployeeCategoryUrl}`);
    //   expect(response1.data.error).toBe("Employee/Employee Category not found of the given ID");
    //   expect(response1.status).toBe(503);
      // console.log(`Employee ${response.data.employeeId} successfully added.`);
    });
  });

