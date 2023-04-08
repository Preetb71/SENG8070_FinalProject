import { Express } from "express";
import { DataSource } from "typeorm";
import { TruckTrip } from "./truckTrip";

export default class TruckTripApi {
    #dataSource: DataSource;
    #express: Express;
  
    constructor(dataSource: DataSource, express: Express) {
      this.#dataSource = dataSource;
      this.#express = express;

      this.#express.get("/truckTrip/:tripId", async (req, res) => {
        return res.json(
          await this.#dataSource.manager.findBy(TruckTrip, {
            tripId: parseInt(req.params.tripId),
          })
        );
      });
  
      this.#express.post("/truckTrip", async (req, res) => {
        const { body } = req;
        console.log(body);
  
        const truckTrip = new TruckTrip();
        truckTrip.origin = body.origin;
        truckTrip.destination = body.destination;
        truckTrip.driverOneId = body.driverOneId;
        truckTrip.driverTwoId = body.driverTwoId;   //null can also be passed in the body
        truckTrip.numberOfShipments = body.numberOfShipments;
        truckTrip.truckNumber = body.truckNumber;
        
        try {
          await this.#dataSource.manager.save(truckTrip);
          console.log(`Truck Trip has been created with the trip id: ${truckTrip.tripId}`);
        } catch (err) {
          res.status(503);
          return res.json({
            error: "Truck Trip creation failed in db.",
          });
        }

        res.status(200);
        return res.json({
          tripId: truckTrip.tripId,
        });
      });

       //Delete Truck using truckNumber
       this.#express.delete("/truckTrip/:tripId",async (req, res) => {

        return res.json(   
          await this.#dataSource.manager.createQueryBuilder()
          .delete().from(TruckTrip)
          .where("tripId = :tripId", {truckNumber:parseInt(req.params.tripId)})
          .execute(),
          );
        });

          //Update Truck using employeeId
          this.#express.put("/truckTrip/:tripId",async (req, res) => {
            const { body } = req;
            return res.json(   
              await this.#dataSource.manager.createQueryBuilder()
              .update(TruckTrip)
              .set({
                origin:body.origin,
                destination:body.destination,
                driverOneId:body.driverOneId,
                driverTwoId:body.driverTwoId,  //null can also be passed in the body
                numberOfShipments:body.numberOfShipments,
                truckNumber:body.truckNumber
            })
              .where("tripId = :tripId", {tripId:parseInt(req.params.tripId)})
              .execute(),
              );
            });
    }
  }