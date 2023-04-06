import { Express } from "express";
import { DataSource } from "typeorm";
import { Employee } from "./employee";

export default class EmployeeApi {
    #dataSource: DataSource;
    #express: Express;
  
    constructor(dataSource: DataSource, express: Express) {
      this.#dataSource = dataSource;
      this.#express = express;
  
      this.#express.get("/employee/:employeeId", async (req, res) => {
        return res.json(
          await this.#dataSource.manager.findBy(Employee, {
            employeeId: parseInt(req.params.employeeId),
          })
        );
      });
  
      this.#express.post("/employee", async (req, res) => {
        const { body } = req;
        console.log(body);
  
        const employee = new Employee();
  
        employee.firstName = body.firstName;
        employee.lastName = body.lastName;
        employee.seniority = body.seniority;
  
        try {
          await this.#dataSource.manager.save(employee);
          console.log(`Employee has been created with the employee id: ${employee.employeeId}`);
        } catch (err) {
          res.status(503);
          return res.json({
            error: "Employee creation failed in db.",
          });
        }
  
        res.status(200);
        return res.json({
          employeeId: employee.employeeId,
        });
      });
    }
  }