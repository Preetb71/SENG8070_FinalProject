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
        const employee = await this.#dataSource.manager.findOneBy(Employee, {
          employeeId: parseInt(req.params.employeeId),
        });

        const driver = await this.#dataSource.manager.findOneBy(Driver, {
          employeeId: parseInt(req.params.employeeId),
        });

        if(employee == null)
        {
          res.status(503);
          return res.json({
            error:"Employee Not Found with the given Id.",
          })
        }

        if(driver == null)
        {
          res.status(503);
          return res.json({
            error:"Driver Employee Not Found with the given Id.",
          })
        }

        return res.json({
          driverId:driver.id,
          employeeId:employee.employeeId,
          employeeFirstName:employee.firstName,
          employeeLastName:employee.lastName,
          employeeSeniority:employee.seniority,
          employeeCategory:employee.category
        });
      });
  
      //Delete Driver using employeeId (Also deletes from employee and employee category automatically which are drivers)
      this.#express.delete("/driver/:employeeId",async (req, res) => {

        const employee =  await this.#dataSource.manager.findOneBy(Employee, {employeeId: parseInt(req.params.employeeId),});
        if(employee == null)
        {
          res.status(503);
          return res.json({
            error:"Employee not found of the given ID"
          });
        }

        const employeeCategory =  await this.#dataSource.manager.findOneBy(EmployeeCategory, {employeeId: parseInt(req.params.employeeId),});
        if(employeeCategory == null)
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