import { Express } from "express";
import { DataSource } from "typeorm";
import { RepairTruck } from "./repairTruck";

export default class RepairTruckApi {
    #dataSource: DataSource;
    #express: Express;
  
    constructor(dataSource: DataSource, express: Express) {
      this.#dataSource = dataSource;
      this.#express = express;

      this.#express.get("/repairTruck/:id", async (req, res) => {
        return res.json(
          await this.#dataSource.manager.findBy(RepairTruck, {
            id: parseInt(req.params.id),
          })
        );
      });
  
      this.#express.post("/repairTruck", async (req, res) => {
        const { body } = req;
        console.log(body);
  
        const repairTruck = new RepairTruck();
        repairTruck.truckNumber = body.truckNumber;
        repairTruck.mechanicName = body.mechanicName;
        repairTruck.daysOfRepair = body.daysOfRepair;
        
        try {
          await this.#dataSource.manager.save(repairTruck);
          console.log(`Truck Repair Information has been created with the id: ${repairTruck.id}`);
        } catch (err) {
          res.status(503);
          return res.json({
            error: "Truck Repair Info creation failed in db.",
          });
        }

        res.status(200);
        return res.json({
          id: repairTruck.id,
          truckNumber: repairTruck.truckNumber,
          mechanicName: repairTruck.mechanicName,
          daysOfRepair: repairTruck.daysOfRepair
        });
      });

       //Delete Repair using repairNumber
       this.#express.delete("/repairTruck/:id",async (req, res) => {

        return res.json(   
          await this.#dataSource.manager.createQueryBuilder()
          .delete().from(RepairTruck)
          .where("id = :id", {id:parseInt(req.params.id)})
          .execute(),
          );
        });

          //Update Repair using id
          this.#express.put("/repairTruck/:id",async (req, res) => {
            const { body } = req;
            return res.json(   
              await this.#dataSource.manager.createQueryBuilder()
              .update(RepairTruck)
              .set({
                truckNumber:body.truckNumber,
                mechanicName:body.mechanicName,
                daysOfRepair:body.daysOfRepair
            })
              .where("id = :id", {id:parseInt(req.params.id)})
              .execute(),
              );
            });
    }
  }