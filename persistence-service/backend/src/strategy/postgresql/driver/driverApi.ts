import { Express } from "express";
import { DataSource } from "typeorm";
import { Driver } from "./driver";
import { parse } from "path";
import { request } from "http";

export default class DriverApi {
    #dataSource: DataSource;
    #express: Express;
  
    constructor(dataSource: DataSource, express: Express) {
      this.#dataSource = dataSource;
      this.#express = express;
  
      //Get a driver
      this.#express.get("/driver/:employeeId", async (req, res) => {
        return res.json(
          await this.#dataSource.manager.findBy(Driver, {
            employeeId: parseInt(req.params.employeeId),
          })
        );
      });
  
      //Delete Driver using employeeId (Also deletes from employee and employee category automatically which are drivers)
      this.#express.delete("/driver/:employeeId",async (req, res) => {
        return res.json(   
          await this.#dataSource.manager.createQueryBuilder()
          .delete().from(Driver)
          .where("employeeId = :employeeId", {employeeId:parseInt(req.params.employeeId)})
          .execute()
          );
        });

        //Update Driver using employeeId  (Can update the whole employee details which are drivers)
        this.#express.put("/driver/:employeeId",async (req, res) => {
          const { body } = req;
          return res.json(   
            await this.#dataSource.manager.createQueryBuilder()
            .update(Driver)
            .set({category: body.category})
            .where("employeeId = :employeeId", {employeeId:parseInt(req.params.employeeId)})
            .execute()
            );
          });
    }

    
  }