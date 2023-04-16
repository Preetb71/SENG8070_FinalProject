import { Express } from "express";
import { DataSource } from "typeorm";
import { RepairTruck } from "./repairTruck";
import { Truck } from "../truck";
import { Mechanic } from "../mechanic";

export default class RepairTruckApi {
    #dataSource: DataSource;
    #express: Express;
  
    constructor(dataSource: DataSource, express: Express) {
      this.#dataSource = dataSource;
      this.#express = express;

      //GET REPAIR TRUCK RECORD
      this.#express.get("/repairTruck/:id", async (req, res) => {
        const repairTruck = await this.#dataSource.manager.findOneBy(RepairTruck,{
          id:parseInt(req.params.id),
        })

        if(repairTruck == null)
        {
          res.status(503);
          return res.json({
            error:"Repair truck record was not found with the given ID."
          })
        }

        console.log(repairTruck);

        res.status(200);
        return res.json({
            repairTruckId:repairTruck.id,
            repairTruckName:JSON.stringify(repairTruck.truck),
            repairTruckMechanic:JSON.stringify(repairTruck.mechanic),
            daysOfRepair:repairTruck.daysOfRepair
        });
      });
      

      //INSERT REPAIR TRUCK RECORD
      this.#express.post("/repairTruck", async (req, res) => {
        const { body } = req;
        console.log(body);
        
        const truck = await this.#dataSource.manager.findOneBy(Truck,{
          truckNumber:parseInt(body.truckNumber),
        })

        if(truck == null)
        {
          res.status(503);
          return res.json({
            error:"No such truck found to add a repair record for, with the given truck number."
          })
        }

        const mechanic = await this.#dataSource.manager.findOneBy(Mechanic,{
          employeeId:parseInt(body.employeeId),
        })

        if(mechanic == null)
        {
          res.status(503);
          return res.json({
            error:"No such mechanic found to add to repair truck, with the given employeeId."
          })
        }

        const repairTruck = new RepairTruck();
        repairTruck.truck = truck;
        repairTruck.mechanic = mechanic;
        repairTruck.daysOfRepair = body.daysOfRepair;


        //Increase the number of repairs here for the truck and update it.
        var num = truck.numberOfRepairs;
        num +=1;
        await this.#dataSource.manager.update(Truck, {truckNumber:repairTruck.truck.truckNumber}, {numberOfRepairs:num});

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
          truckNumber: JSON.stringify(repairTruck.truck),
          mechanicName: JSON.stringify(repairTruck.mechanic),
          daysOfRepair: repairTruck.daysOfRepair
        });
      });

       //DELETE REPAIR TRUCK RECORD
       this.#express.delete("/repairTruck/:id",async (req, res) => {
        
        const repairTruck = await this.#dataSource.manager.findOneBy(RepairTruck,{
          id:parseInt(req.params.id),
        })

        if(repairTruck == null)
        {
          res.status(503);
          return res.json({
            error:"No such repair truck record found with the given id."
          })
        }

          //#region //FIND THE TRUCK THAT WAS REPAIRED AND REDUCE ITS NUMBER OF REPAIRS
          var repairedTruckId = repairTruck.truck?.truckNumber;
          const truck = await this.#dataSource.manager.find(Truck, {
            where:{
              truckNumber:repairedTruckId
            }
          });
  
          if(truck.length > 0)
          {
            for(let i= 0; i<truck.length; i++)
            {
              if(truck[i] != null)
              {
                var num = truck[i].numberOfRepairs;
                if(num>0)
                {
                  num -= 1;
                }
                await this.#dataSource.manager.update(Truck, {truckNumber:truck[i].truckNumber}, {numberOfRepairs:num} )
              }
            }
          }
          //#endregion

          //#region UPDATE THE REPAIR TRUCK RELATIONS TO NULL FIRST
          //Set truck to null
            try {
              await this.#dataSource.manager.update(RepairTruck, {id:repairTruck.id}, {truck:null} )
            } catch (err) {
              res.status(503);
              return res.json({
                error: "RepairTruck Null update failed in db.",
              });
            }
            //Set Mechanic to null
            try {
              await this.#dataSource.manager.update(RepairTruck, {id:repairTruck.id}, {mechanic:null} )
            } catch (err) {
              res.status(503);
              return res.json({
                error: "RepairTruck Null update failed in db.",
              });
            }
          //#endregion

          try {
            await this.#dataSource.manager.remove(repairTruck);
            console.log(`Repair Truck Record has been removed`);
          } catch (err) {
            res.status(503);
            return res.json({
              error: "Repair Truck Record removal failed in db.",
            });
          }
        
        res.status(200);
        return res.send("Repair Record and its associated references have been successfully removed from the database.");
        });

        //UPDATE REPAIR TRUCK RECORD
        this.#express.put("/repairTruck/:id",async (req, res) => {
          const { body } = req;


          const repairTruck = await this.#dataSource.manager.findOneBy(RepairTruck,{
            id:parseInt(req.params.id),
          })
  
          if(repairTruck == null)
          {
            res.status(503);
            return res.json({
              error:"Repair truck record was not found with the given ID."
            })
          }

          try { await this.#dataSource.manager.update(RepairTruck, {id:repairTruck.id}, {daysOfRepair:parseInt(body.daysOfRepair)});
            console.log(`Truck Repair Information has been updated with the id: ${repairTruck.id}`);
          } catch (err) {
            res.status(503);
            return res.json({
              error: "Truck Repair Info update failed in db.",
            });
          }

          res.status(200);
          return res.json({
              repairTruckId:repairTruck.id,
              truckNumber:repairTruck.truck,
              mechanicName:repairTruck.mechanic,
              daysOfRepair:repairTruck.daysOfRepair
             })
          });
    }
  }