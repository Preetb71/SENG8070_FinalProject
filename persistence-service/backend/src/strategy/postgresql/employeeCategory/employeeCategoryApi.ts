import { Express } from "express";
import { DataSource } from "typeorm";
import { EmployeeCategory } from "./employeeCategory";
import { parse } from "path";
import { request } from "http";

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

      //Delete Category using employeeId, Also deletes from employee table and drivers or mechanic table
      this.#express.delete("/employeeCategory/:employeeId",async (req, res) => {
        return res.json(   
          await this.#dataSource.manager.createQueryBuilder()
          .delete().from(EmployeeCategory)
          .where("employeeId = :employeeId", {employeeId:parseInt(req.params.employeeId)})
          .execute()
          );
        });

        //Update Category using employeeId
        this.#express.put("/employeeCategory/:employeeId",async (req, res) => {
          const { body } = req;
          return res.json(   
            await this.#dataSource.manager.createQueryBuilder()
            .update(EmployeeCategory)
            .set({category: body.category})
            .where("employeeId = :employeeId", {employeeId:parseInt(req.params.employeeId)})
            .execute()
            );
          });
    }

    
  }