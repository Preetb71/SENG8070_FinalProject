import { Express } from "express";
import { DataSource } from "typeorm";
import { Mechanic } from "./mechanic";
import { parse } from "path";
import { request } from "http";
import { Employee } from "../employee";
import { EmployeeCategory } from "../employeeCategory";

export default class MechanicApi {
    #dataSource: DataSource;
    #express: Express;
  
    constructor(dataSource: DataSource, express: Express) {
      this.#dataSource = dataSource;
      this.#express = express;
  
      //Add/Update brand specialization
      // this.#express.put("/mechanic/:truckNumber", async (req, res) => {
      //   const { body } = req;
      //   console.log(body);
      //   return res.json(
      //     await this.#dataSource.manager.createQueryBuilder()
      //     .update(Mechanic)
      //     .set({brandS: body.category})
      //     .where("employeeId = :employeeId", {employeeId:parseInt(req.params.employeeId)})
      //     .execute()
      //   );
      // });

      //Get a mechanic and their details
      this.#express.get("/mechanic/:employeeId", async (req, res) => {
        const employee = await this.#dataSource.manager.findBy(Employee, {
          employeeId: parseInt(req.params.employeeId),
        });

        const mechanic = await this.#dataSource.manager.findBy(Mechanic, {
          employeeId: parseInt(req.params.employeeId),
        });

        if(mechanic.length <= 0)
        {
          res.status(503);
          return res.json({
            error:"Mechanic Employee Not Found with the given Id.",
          })
        }
        return res.json({
          mechanicId:mechanic[0].id,
          employeeId:employee[0].employeeId,
          employeeFirstName:employee[0].firstName,
          employeeLastName:employee[0].lastName,
          employeeSeniority:employee[0].seniority,
          employeeCategory:employee[0].category
        });
      });
  
      //Delete Mechanic using employeeId (Also deletes from employee and employee category automatically which are mechanics)
      this.#express.delete("/mechanic/:employeeId",async (req, res) => {
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

        const mechanic = await this.#dataSource.manager.findOneBy(Mechanic, {
          employeeId: parseInt(req.params.employeeId),
        });

        await this.#dataSource.manager.remove(mechanic);
        await this.#dataSource.manager.remove(employeeCategory);
        await this.#dataSource.manager.remove(employee);

        res.status(200);
        return res.json({
          success:'Mechanic and its associated entities removed successfully.'
        });
      });

        //Update Mechanic's Brand using employeeId  (Can update the whole employee details which are drivers)
        // this.#express.put("/mechanic/:employeeId",async (req, res) => {
        //   const { body } = req;
        //   return res.json(   
        //     await this.#dataSource.manager.createQueryBuilder()
        //     .update(Mechanic)
        //     .set({category: body.category})
        //     .where("employeeId = :employeeId", {employeeId:parseInt(req.params.employeeId)})
        //     .execute()
        //     );
        //   });
    }

    
  }