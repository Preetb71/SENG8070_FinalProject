import { Express } from "express";
import { DataSource } from "typeorm";
import { Shipment } from "./shipment";

export default class ShipmentApi {
    #dataSource: DataSource;
    #express: Express;
  
    constructor(dataSource: DataSource, express: Express) {
      this.#dataSource = dataSource;
      this.#express = express;

      this.#express.get("/shipment/:shipmentId", async (req, res) => {
        return res.json(
          await this.#dataSource.manager.findBy(Shipment, {
            shipmentId: parseInt(req.params.shipmentId),
          })
        );
      });
  
      this.#express.post("/shipment", async (req, res) => {
        const { body } = req;
        console.log(body);
  
        const shipment = new Shipment();
        shipment.shipmentWeight = body.shipmentWeight;
        shipment.shipmentValue = body.shipmentValue;
        shipment.origin = body.origin;
        shipment.destination = body.destination;
        shipment.truckNumber = body.truckNumber;
        shipment.customerId = body.customerId;
        
        try {
          await this.#dataSource.manager.save(shipment);
          console.log(`Shipment has been created with the shipment id: ${shipment.shipmentId}`);
        } catch (err) {
          res.status(503);
          return res.json({
            error: "Shipment creation failed in db.",
          });
        }

        res.status(200);
        return res.json({
          shipmentId: shipment.shipmentId,
        });
      });

       //Delete Customer using customerId
       this.#express.delete("/shipment/:shipmentId",async (req, res) => {

        return res.json(   
          await this.#dataSource.manager.createQueryBuilder()
          .delete().from(Shipment)
          .where("shipmentId = :shipmentId", {shipmentId:parseInt(req.params.shipmentId)})
          .execute(),
          );
        });

          //Update Customer using customerId
          this.#express.put("/shipment/:shipmentId",async (req, res) => {
            const { body } = req;
            return res.json(   
              await this.#dataSource.manager.createQueryBuilder()
              .update(Shipment)
              .set({
                shipmentWeight:body.shipmentWeight,
                shipmentValue:body.shipmentValue,
                origin:body.origin,
                destination:body.destination,
                truckNumber:body.truckNumber,
                customerId:body.customerId
            })
              .where("shipmentId = :shipmentId", {shipmentId:parseInt(req.params.shipmentId)})
              .execute(),
              );
            });
    }
  }