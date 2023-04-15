import axios from "axios";
import { before } from "node:test";
import { postgresDataSource } from "../configure";
import { response } from "express";

//THIS METHOD CLEARS ALL TABLES BEFORE RUNNING THE UNIT TESTS.
beforeAll(async()=>{
  //Get All entities in the datasource
  const entities = postgresDataSource.entityMetadatas;
  for(const entity of entities)
  {
      const repository = postgresDataSource.getRepository(entity.name) // Get repository
      await repository.clear(); // Clear each entity table's content
  }
})


describe("Insert an employee test", () => {
  it("inserts the employee and its associated tables", async () => {
    const response = await axios.post("http://localhost:8000/employee",
    {
      firstName:"Preet", lastName:"Bhatt", seniority:"junior", category:"driver"
    });
    expect(response.status).toBe(200);
    expect(response.data.employeeId).toBe(1);
    expect(response.data.firstName).toBe("Preet");
    expect(response.data.lastName).toBe("Bhatt");
    expect(response.data.seniority).toBe("junior");
    expect(response.data.category).toBe("driver");
  });
});