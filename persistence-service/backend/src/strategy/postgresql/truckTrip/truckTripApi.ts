import { Express } from "express";
import { DataSource } from "typeorm";
import { TruckTrip } from "./truckTrip";
import { Driver } from "../driver";
import { Truck } from "../truck/truck";
import { Shipment } from "../shipment";

export default class TruckTripApi {
    #dataSource: DataSource;
    #express: Express;
  
    constructor(dataSource: DataSource, express: Express) {
      this.#dataSource = dataSource;
      this.#express = express;


      //GET TRUCK TRIP
      this.#express.get("/truckTrip/:tripId", async (req, res) => {
        const truckTrip = await this.#dataSource.manager.findOneBy(TruckTrip,{
            tripId: parseInt(req.params.tripId),
        })

        if(truckTrip == null)
        {
          res.status(503);
          return res.json({
            error:"No Truck Trip found with the given truck Id."
          })
        }

        res.status(200);
        return res.json({
          tripId:truckTrip.tripId,
          origin:truckTrip.origin,
          destination:truckTrip.destination,
          driverOne:truckTrip.driverOne,
          driverTwo:truckTrip.driverTwo,
          numberOfShipments:truckTrip.numberOfShipments,
          truck:truckTrip.truck
        });
      });
  

      //INSERT TRUCK TRIP
      this.#express.post("/truckTrip", async (req, res) => {
        const { body } = req;
        console.log(body);       

        const truckTrip = new TruckTrip();
        truckTrip.origin = body.origin;
        truckTrip.destination = body.destination;   //null can also be passed in the body
        truckTrip.numberOfShipments = 0;

        const driverOne = await this.#dataSource.manager.findOneBy(Driver,{
          employeeId:body.driverOneEmployeeId,
        })

        if(driverOne == null)
        {
          res.status(503);
          return res.json({
            error:"No driver one employee found with the given employee id."
          })
        }

        truckTrip.driverOne = driverOne;

        const driverTwo = await this.#dataSource.manager.findOneBy(Driver,{
          employeeId:body.driverTwoEmployeeId,
        })

        if(body.driverTwoEmployeeId == null)
        {
          truckTrip.driverTwo = null;
        }
        else
        {
          if(driverTwo == null)
          {
            res.status(503);
            return res.json({
              error:"No driver two employee found with the given employee id."
            })
          }
          truckTrip.driverTwo = driverTwo;
        }

        const truck = await this.#dataSource.manager.findOneBy(Truck,{
          truckNumber:body.truckNumber,
        })

        if(truck == null)
        {
          res.status(503);
          return res.json({
            error:"No truck found with the given truck number."
          })
        }

        truckTrip.truck = truck;

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
          tripId:truckTrip.tripId,
          origin:truckTrip.origin,
          destination:truckTrip.destination,
          driverOne:truckTrip.driverOne,
          driverTwo:truckTrip.driverTwo,
          numberOfShipments:truckTrip.numberOfShipments,
          truck:truckTrip.truck
        });
      });

      //DELETE TRUCK TRIP
      this.#express.delete("/truckTrip/:tripId",async (req, res) => {

      const truckTrip = await this.#dataSource.manager.findOneBy(TruckTrip,{
          tripId: parseInt(req.params.tripId),
      })

      if(truckTrip == null)
      {
        res.status(503);
        return res.json({
          error:"No Truck Trip found with the given truck Id."
        })
      }

       //#region //FIND THE SHIPMENT THAT THIS TRUCK TRIP IS REFERENCED IN and set the reference to NULL.
        const shipment = await this.#dataSource.manager.find(Shipment, {
          relations:{truckTrip :true},
          where:{
            truckTrip:{
              tripId:truckTrip.tripId
            }
          }
        });

          if(shipment.length > 0)
                {
                  for(let i= 0; i<shipment.length; i++)
                  {
                    if(shipment[i] != null)
                    {
                        // truckTripDriverOne[i].driverOne = null;
                      await this.#dataSource.manager.update(Shipment, {shipmentId:shipment[i].shipmentId}, {truckTrip:null} )
                      // await this.#dataSource.manager.save(truckTripDriverOne[i]);
                    }
                  }
                }
            //#endregion
      
            //#region //SET THE REFERENCES OF THIS TRUCK TRIP RECORD TO NULL before removing.

            try {
              await this.#dataSource.manager.update(TruckTrip,{tripId:truckTrip.tripId}, {truck:null, driverOne:null, driverTwo:null});
              console.log(`Truck Trip has been updated with the trip id: ${truckTrip.tripId}`);
            } catch (err) {
              res.status(503);
              return res.json({
                error: "Truck Trip deletion failed in db.",
              });
            }

            //#endregion
      try {
        await this.#dataSource.manager.remove(truckTrip);
        console.log(`Truck Trip has been removed with the trip id: ${truckTrip.tripId}`);
      } catch (err) {
        res.status(503);
        return res.json({
          error: "Truck Trip deletion failed in db.",
        });
      }

      res.status(200);
      return res.send("Truck Trip Record and its associated references have been removed successfully!");
      });

      //UPDATE TRUCK TRIP
      this.#express.put("/truckTrip/:tripId",async (req, res) => {
        const { body } = req;

        const truckTrip = await this.#dataSource.manager.findOneBy(TruckTrip,{
          tripId: parseInt(req.params.tripId),
        })

        if(truckTrip == null)
        {
          res.status(503);
          return res.json({
            error:"No Truck Trip found with the given truck Id."
          })
        }
       
        truckTrip.origin = body.origin;
        truckTrip.destination = body.destination;   //null can also be passed in the body

        const driverOne = await this.#dataSource.manager.findOneBy(Driver,{
          employeeId:body.driverOneEmployeeId,
        })

        if(driverOne == null)
        {
          res.status(503);
          return res.json({
            error:"No driver one employee found with the given employee id."
          })
        }

        truckTrip.driverOne = driverOne;

        const driverTwo = await this.#dataSource.manager.findOneBy(Driver,{
          employeeId:body.driverTwoEmployeeId,
        })

        if(body.driverTwoEmployeeId == null)
        {
          truckTrip.driverTwo = null;
        }
        else
        {
          if(driverTwo == null)
          {
            res.status(503);
            return res.json({
              error:"No driver two employee found with the given employee id."
            })
          }
          truckTrip.driverTwo = driverTwo;
        }

        const truck = await this.#dataSource.manager.findOneBy(Truck,{
          truckNumber:body.truckNumber,
        })

        if(truck == null)
        {
          res.status(503);
          return res.json({
            error:"No truck found with the given truck number."
          })
        }

        truckTrip.truck = truck;

        try {
          await this.#dataSource.manager.update(TruckTrip, {tripId:truckTrip.tripId},{origin:body.origin, destination:body.destination, driverOne:driverOne, driverTwo:driverOne, truck:truck});
          console.log(`Truck Trip has been updated with the trip id: ${truckTrip.tripId}`);
        } catch (err) {
          res.status(503);
          return res.json({
            error: "Truck Trip update failed in db.",
          });
        }

        res.status(200);
        return res.json({
          tripId:truckTrip.tripId,
          origin:truckTrip.origin,
          destination:truckTrip.destination,
          driverOne:truckTrip.driverOne,
          driverTwo:truckTrip.driverTwo,
          numberOfShipments:truckTrip.numberOfShipments,
          truck:truckTrip.truck
        });
        });
    }
  }