import { Express } from "express";
import { DataSource } from "typeorm";
import { Driver } from "./driver";
import { parse } from "path";
import { request } from "http";
import { Employee } from "../employee";
import { EmployeeCategory } from "../employeeCategory";

export default class DriverApi {
    #dataSource: DataSource;
    #express: Express;
  
    constructor(dataSource: DataSource, express: Express) {
      this.#dataSource = dataSource;
      this.#express = express;
  
      //Get a driver and their details
      this.#express.get("/driver/:employeeId", async (req, res) => {
        const employee = await this.#dataSource.manager.findBy(Employee, {
          employeeId: parseInt(req.params.employeeId),
        });

        const driver = await this.#dataSource.manager.findBy(Driver, {
          employeeId: parseInt(req.params.employeeId),
        });


        if(driver.length <= 0)
        {
          res.status(503);
          return res.json({
            error:"Driver Employee Not Found with the given Id.",
          })
        }
        return res.json({
          driverId:driver[0].id,
          employeeId:employee[0].employeeId,
          employeeFirstName:employee[0].firstName,
          employeeLastName:employee[0].lastName,
          employeeSeniority:employee[0].seniority,
          employeeCategory:employee[0].category
        });
      });
  
      //Delete Driver using employeeId (Also deletes from employee and employee category automatically which are drivers)
      this.#express.delete("/driver/:employeeId",async (req, res) => {

        const employee =  await this.#dataSource.manager.findBy(Employee, {employeeId: parseInt(req.params.employeeId),});
        if(employee.length <= 0)
        {
          res.status(503);
          return res.json({
            error:"Employee not found of the given ID"
          });
        }

        const employeeCategory =  await this.#dataSource.manager.findBy(EmployeeCategory, {employeeId: parseInt(req.params.employeeId),});
        if(employeeCategory.length <= 0)
        {
          res.status(503);
          return res.json({
            error:"Employee Category not found of the given ID"
          });
        }

        const driver = await this.#dataSource.manager.findOneBy(Driver, {
          employeeId: parseInt(req.params.employeeId),
        });

        await this.#dataSource.manager.remove(driver);
        await this.#dataSource.manager.remove(employeeCategory);
        await this.#dataSource.manager.remove(employee);

        res.status(200);
        return res.json({
          success:'Driver and its associated entities removed successfully.'
        });
      });
    }
  }