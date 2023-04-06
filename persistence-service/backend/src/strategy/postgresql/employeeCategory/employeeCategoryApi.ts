import { Express } from "express";
import { DataSource } from "typeorm";
import { EmployeeCategory } from "./employeeCategory";

export default class EmployeeCategoryApi {
    #dataSource: DataSource;
    #express: Express;
  
    constructor(dataSource: DataSource, express: Express) {
      this.#dataSource = dataSource;
      this.#express = express;
  
      //Get a employee's category
      this.#express.get("/employeeCategory/:employeeId", async (req, res) => {
        return res.json(
          await this.#dataSource.manager.findBy(EmployeeCategory, {
            employeeId: parseInt(req.params.employeeId),
          })
        );
      });
  
      this.#express.post("/employeeCategory", async (req, res) => {
        const { body } = req;
        console.log(body);
  
        const employeeCategory = new EmployeeCategory();
  
        employeeCategory.employeeId = body.employeeId;  //Pass in the employeeID that exists
        employeeCategory.category = body.category;
  
        try {
          await this.#dataSource.manager.save(employeeCategory);
          console.log(`EmployeeCategory has been created with the employee id: ${employeeCategory.employeeId}`);
        } catch (err) {
          res.status(503);
          return res.json({
            error: "Employee Category creation failed in db.",
          });
        }
  
        res.status(200);
        return res.json({
          employeeId: employeeCategory.employeeId,
        });
      });
    }
  }