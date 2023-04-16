import { Express } from "express";
import { DataSource, Equal } from "typeorm";
import { Truck } from "./truck";
import { Mechanic } from "../mechanic";
import { RepairTruck } from "../repairTruck";
import { TruckTrip } from "../truckTrip";
import { Shipment } from "../shipment";

export default class TruckApi {
    #dataSource: DataSource;
    #express: Express;
  
    constructor(dataSource: DataSource, express: Express) {
      this.#dataSource = dataSource;
      this.#express = express;

      //FETCH A TRUCK RECORD USING TRUCK NUMBER 
      this.#express.get("/truck/:truckNumber", async (req, res) => {
        const truck =  await this.#dataSource.manager.findOneBy(Truck, {
          truckNumber: parseInt(req.params.truckNumber),
        });

        if(truck == null)
        {
          res.status(503);
          return res.json({
            error:"No truck was found with the given Truck Number."
          })
        }

        res.status(200);
        return res.json({
          truckNumber:truck.truckNumber,
          truckBrand:truck.truckBrand,
          truckLoad:truck.truckLoad,
          truckCapacity:truck.truckCapacity,
          truckYear:truck.truckYear,
          numberOfRepairs:truck.numberOfRepairs
        });
      });
      
      //INSERT A TRUCK RECORD
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
          truckBrand:truck.truckBrand,
          truckLoad:truck.truckLoad,
          truckCapacity:truck.truckCapacity,
          truckYear:truck.truckYear,
          numberOfRepairs:truck.numberOfRepairs
        });
      });

      //DELETE TRUCK RECORD AND ITS ASSCIATED RECORDS (THIS WILL ALSO DELETE THE TRUCKS' SHIPMENT RECORD, TRIP RECORD AND REPAIR RECORD)
        this.#express.delete("/truck/:truckNumber",async (req, res) => 
        {

          const truck =  await this.#dataSource.manager.findOneBy(Truck, {
            truckNumber: parseInt(req.params.truckNumber),
          });

          if(truck == null)
          {
            res.status(503);
            return res.json({
              error:"No truck was found with the given Truck Number."
            })
          }

          //REMOVE THE TRUCK BRAND FROM THE PARTICULAR MECHANICs THAT HAS A SPECIALIZATION.  
          const mechanic =  await this.#dataSource.manager.findBy(Mechanic, {
            brandSpecialization: truck,
          });

          if(mechanic != null)
          {
            for(let i = 0; i<mechanic.length; i++)
            {
              await this.#dataSource.manager.update(Mechanic, {employeeId:mechanic[i].employeeId},{brandSpecialization:null})
            }
          }

          //REMOVE THE TRUCK'S REPAIR RECORDs IF THE TRUCK IS BEING DELETED.
          const repairTruck =  await this.#dataSource.manager.find(RepairTruck, {
            where:{
              truck:{
                  truckNumber:truck.truckNumber
              }
            }
          });

          //If there exists repair truck records remove it.
          if(repairTruck.length>0)
          {
              for(let i = 0; i<repairTruck.length; i++)
              {
                await this.#dataSource.manager.update(RepairTruck, {id:repairTruck[i].id}, {mechanic:null, truck:null});
                await this.#dataSource.manager.remove(repairTruck[i]);  //REMOVES EACH REPAIR TRUCK RECORD OF THE TRUCK THAT IS FOUND.
              }
          }

          //REMOVE THE TRUCK'S TRIPS IF THE TRUCK IS BEING DELETED.
          const truckTrips =  await this.#dataSource.manager.find(TruckTrip, {
            where:{
              truck:{
                truckNumber:truck.truckNumber
              }
            }
          });

          //If there exists repair truck records remove it.
          if(truckTrips.length>0)
          {
              for(let i = 0; i<truckTrips.length; i++)
              {
                    //REMOVE THE TRUCK'S ASSOCIATED SHIPMENT DATA IF THE TRUCK IS BEING DELETED.
                    const shipments =  await this.#dataSource.manager.find(Shipment, {
                      where:{
                        truckTrip:{
                          truck:{
                            truckNumber:truck.truckNumber
                          }
                        }
                      }
                    });

                  //If there exists repair truck records remove it.
                  if(shipments.length>0)
                  {
                      for(let i = 0; i<shipments.length; i++)
                      {
                        //SET ALL VALUES TO NULL BEFORE DELETING.
                        await this.#dataSource.manager.update(Shipment, {shipmentId:shipments[i].shipmentId}, {truckTrip:null});
                        // await this.#dataSource.manager.remove(shipments[i]);  //REMOVES EACH TRIP RECORD RECORD OF THE TRUCK THAT IS FOUND.
                      }
                  }
                  await this.#dataSource.manager.update(TruckTrip, {tripId:truckTrips[i].tripId}, {truck:null, driverOne:null, driverTwo:null});
                  await this.#dataSource.manager.remove(truckTrips[i]);  //REMOVES EACH TRIP RECORD RECORD OF THE TRUCK THAT IS FOUND.
              }
          }

        

          await this.#dataSource.manager.remove(truck);
          res.status(200);
          return res.json({
              success:"Truck and its associated records were deleted successfully."
          });
        });

      //UPDATE TRUCK AND ITS ASSOCIATED RECORDS USING TRUCK NUMBER
      this.#express.put("/truck/:truckNumber",async (req, res) => {
        const { body } = req;

        const truck =  await this.#dataSource.manager.findOneBy(Truck, {
          truckNumber: parseInt(req.params.truckNumber),
        });

        if(truck == null)
        {
          res.status(503);
          return res.json({
            error:"No truck was found with the given Truck Number."
          })
        }

        //UPDATE THE TRUCK BRAND FROM THE PARTICULAR MECHANICS THAT HAS A SPECIALIZATION.  
        const mechanic =  await this.#dataSource.manager.find(Mechanic, {
          where:{
            brandSpecialization:{
              truckNumber:truck.truckNumber
            }
          }
        });

        truck.truckBrand = body.truckBrand;
        truck.truckLoad = body.truckLoad;
        truck.truckCapacity = body.truckCapacity;
        truck.truckYear = body.truckYear;

          
        if(mechanic != null)
        {
          for(let i = 0; i<mechanic.length; i++)
          {
            await this.#dataSource.manager.update(Mechanic,{employeeId:mechanic[i].employeeId}, {brandSpecialization:truck})
          }
        }

        await this.#dataSource.manager.save(truck);

        res.status(200);
        return res.json(   
          {
            truckNumber: truck.truckNumber,
            truckBrand:truck.truckBrand,
            truckLoad:truck.truckLoad,
            truckCapacity:truck.truckCapacity,
            truckYear:truck.truckYear,
            numberOfRepairs:truck.numberOfRepairs,
            success:"Truck was successfully updated."
          });
        });
    }
  }