import { Express } from "express";
import { DataSource } from "typeorm";
import { Truck } from "./truck";

export default class TruckApi {
    #dataSource: DataSource;
    #express: Express;
  
    constructor(dataSource: DataSource, express: Express) {
      this.#dataSource = dataSource;
      this.#express = express;

      this.#express.get("/truck/:truckNumber", async (req, res) => {
        return res.json(
          await this.#dataSource.manager.findBy(Truck, {
            truckNumber: parseInt(req.params.truckNumber),
          })
        );
      });
  
      this.#express.post("/truck", async (req, res) => {
        const { body } = req;
        console.log(body);
  
        const truck = new Truck();
  
        truck.truckBrand = body.truckBrand;
        truck.truckLoad = body.truckLoad;
        truck.truckCapacity = body.truckCapacity;
        truck.truckYear = body.truckYear;
        truck.numberOfRepairs = 0;  //Intial number of repairs will be zero as the truck was just added. It will be adjusted if a repair is there for this truck.
  
        try {
          await this.#dataSource.manager.save(truck);
          console.log(`Truck has been created with the employee id: ${truck.truckNumber}`);
        } catch (err) {
          res.status(503);
          return res.json({
            error: "Truck creation failed in db.",
          });
        }

        res.status(200);
        return res.json({
          truckNumber: truck.truckNumber,
        });
      });

       //Delete Truck using truckNumber
       this.#express.delete("/truck/:truckNumber",async (req, res) => {

        return res.json(   
          await this.#dataSource.manager.createQueryBuilder()
          .delete().from(Truck)
          .where("truckNumber = :truckNumber", {truckNumber:parseInt(req.params.truckNumber)})
          .execute(),
          );
        });

          //Update Truck using employeeId
          this.#express.put("/truck/:truckNumber",async (req, res) => {
            const { body } = req;
            return res.json(   
              await this.#dataSource.manager.createQueryBuilder()
              .update(Truck)
              .set({truckBrand:body.truckBrand, truckLoad:body.truckLoad, truckCapacity:body.truckCapacity, truckYear:body.truckYear})
              .where("truckNumber = :truckNumber", {truckNumber:parseInt(req.params.truckNumber)})
              .execute(),
              );
            });
    }
  }