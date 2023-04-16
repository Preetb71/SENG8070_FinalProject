import { Express } from "express";
import { DataSource } from "typeorm";
import { Shipment } from "./shipment";
import { TruckTrip } from "../truckTrip";
import { Customer } from "../customer";

export default class ShipmentApi {
    #dataSource: DataSource;
    #express: Express;
  
    constructor(dataSource: DataSource, express: Express) {
      this.#dataSource = dataSource;
      this.#express = express;


      //GET A SHIPMENT
      this.#express.get("/shipment/:shipmentId", async (req, res) => {

        const shipment = await this.#dataSource.manager.findOneBy(Shipment,{
          shipmentId:parseInt(req.params.shipmentId),
        });

        if(shipment == null)
        {
          res.status(503);
          return res.json({
            error:"No shipment found with the given id."
          })
        }


        res.status(200);
        return res.json({
          shipmentId:shipment.shipmentId,
          shipmentValue:shipment.shipmentValue,
          shipmentWeight:shipment.shipmentWeight,
          shipmentTrip:shipment.truckTrip,
          shipmentCustomer:shipment.customer
        });
      });
  
      //ADD A SHIPMENT
      this.#express.post("/shipment", async (req, res) => {
        const { body } = req;
        console.log(body);

        const truckTrip = await this.#dataSource.manager.findOneBy(TruckTrip,{
          tripId:parseInt(body.tripId),
        });

        if(truckTrip == null)
        {
          res.status(503);
          return res.json({
            error:"No such truck trip found to associate with the shipment by the given trip ID."
          })
        }

        const customer = await this.#dataSource.manager.findOneBy(Customer,{
          customerId:body.customerId,
        });

        if(customer == null)
        {
          res.status(503);
          return res.json({
            error:"No such customer found to associate with the shipment by the given customer ID."
          })
        }
        
        console.log(customer);

        const shipment = new Shipment();
        shipment.shipmentWeight = body.shipmentWeight;
        shipment.shipmentValue = body.shipmentValue;
        shipment.truckTrip = truckTrip;
        shipment.customer = customer;
        var num = truckTrip.numberOfShipments;
        num += 1;

        //UPDATE TRUCK TRUP FOR NUMBER OF SHIPMENTS
        await this.#dataSource.manager.update(TruckTrip, {tripId:shipment.truckTrip.tripId}, {numberOfShipments:num});

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
          shipmentId:shipment.shipmentId,
          shipmentValue:shipment.shipmentValue,
          shipmentWeight:shipment.shipmentWeight,
          shipmentTrip:shipment.truckTrip,
          shipmentCustomer:shipment.customer
        });
      });

       //DELETE A SHIPMENT
       this.#express.delete("/shipment/:shipmentId",async (req, res) => {

        const shipment = await this.#dataSource.manager.findOneBy(Shipment,{
          shipmentId:parseInt(req.params.shipmentId),
        });

        if(shipment == null)
        {
          res.status(503);
          return res.json({
            error:"No shipment found with the given id."
          })
        }

        var tripIdShip = shipment.truckTrip?.tripId;

        //FIND THE TRUCK TRIP THAT THIS SHIPMENT IS REFERENCED IN and reduce its number of shipments
        const truckTrip = await this.#dataSource.manager.find(TruckTrip, {
          relations:{driverOne :true},
          where:{
            tripId:tripIdShip
          }
        });

        if(truckTrip.length > 0)
        {
          for(let i= 0; i<truckTrip.length; i++)
          {
            if(truckTrip[i] != null)
            {
              var num = truckTrip[i].numberOfShipments;
              if(num>0)
              {
                num -= 1;
              }
              await this.#dataSource.manager.update(TruckTrip, {tripId:truckTrip[i].tripId}, {numberOfShipments:num} )
            }
          }
        }
        //update new shipment data first
        try {
          await this.#dataSource.manager.update(Shipment, {shipmentId:shipment.shipmentId}, {truckTrip:null} )
          console.log(`Shipment Truck Trip has been updated to null with the shipment id: ${shipment.shipmentId}`);
        } catch (err) {
          res.status(503);
          return res.json({
            error: "Shipment update failed in db.",
          });
        }

        try {
          await this.#dataSource.manager.remove(shipment);
          console.log(`Shipment has been removed with the shipment id: ${shipment.shipmentId}`);
        } catch (err) {
          res.status(503);
          return res.json({
            error: "Shipment removal failed in db.",
          });
        }

        res.status(200);
        return res.json({
          success:"Shipment was successfully removed from the database."
        });
        });

        //UPDATE A SHIPMENT 
        this.#express.put("/shipment/:shipmentId",async (req, res) => {
          const { body } = req;

          const shipment = await this.#dataSource.manager.findOneBy(Shipment,{
            shipmentId:parseInt(req.params.shipmentId),
          });

          if(shipment == null)
          {
            res.status(503);
            return res.json({
              error:"No shipment found to update, with the given shipment ID."
            })
          }

          try {
            await this.#dataSource.manager.update(Shipment, {shipmentId:shipment.shipmentId}, {shipmentWeight:body.shipmentWeight, shipmentValue:body.shipmentValue});
            console.log(`Shipment has been updated with the shipment id: ${shipment.shipmentId}`);
          } catch (err) {
            res.status(503);
            return res.json({
              error: "Shipment update failed in db.",
            });
          }
  
          res.status(200);
          return res.json({
            shipmentId:shipment.shipmentId,
            shipmentValue:body.shipmentValue,
            shipmentWeight:body.shipmentWeight,
          });
          });
    }
  }