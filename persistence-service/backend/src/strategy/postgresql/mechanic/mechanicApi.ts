import { Express } from "express";
import { DataSource } from "typeorm";
import { Mechanic } from "./mechanic";
import { parse } from "path";
import { request } from "http";

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

      //Get a mechanic
      this.#express.get("/mechanic/:employeeId", async (req, res) => {
        return res.json(
          await this.#dataSource.manager.findBy(Mechanic, {
            employeeId: parseInt(req.params.employeeId),
          })
        );
      });
  
      //Delete Mechanic using employeeId (Also deletes from employee and employee category automatically which are mechanics)
      this.#express.delete("/mechanic/:employeeId",async (req, res) => {
        return res.json(   
          await this.#dataSource.manager.createQueryBuilder()
          .delete().from(Mechanic)
          .where("employeeId = :employeeId", {employeeId:parseInt(req.params.employeeId)})
          .execute()
          );
        });

        //Update Mechanic using employeeId  (Can update the whole employee details which are drivers)
        this.#express.put("/mechanic/:employeeId",async (req, res) => {
          const { body } = req;
          return res.json(   
            await this.#dataSource.manager.createQueryBuilder()
            .update(Mechanic)
            .set({category: body.category})
            .where("employeeId = :employeeId", {employeeId:parseInt(req.params.employeeId)})
            .execute()
            );
          });
    }

    
  }