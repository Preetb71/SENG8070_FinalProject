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

        res.status(200);
        return res.json({
            repairTruckId:repairTruck.id,
            repairTruckName:repairTruck.truckNumber.truckBrand,
            repairTruckMechanicEmployeeId:repairTruck.mechanicName.employeeId,
            daysOfRepair:repairTruck.daysOfRepair
        });
      });
  
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
        repairTruck.truckNumber = truck;
        repairTruck.mechanicName = mechanic;
        repairTruck.daysOfRepair = body.daysOfRepair;
        //Increase the number of repairs here for the truck.
        truck.numberOfRepairs += 1;

        try {
          await this.#dataSource.manager.save(repairTruck);
          console.log(`Truck Repair Information has been created with the id: ${repairTruck.id}`);
        } catch (err) {
          res.status(503);
          return res.json({
            error: "Truck Repair Info creation failed in db.",
          });
        }
        
        try {
          await this.#dataSource.manager.save(truck);
          console.log(`Truck Repair Information has been created with the id: ${repairTruck.id}`);
        } catch (err) {
          res.status(503);
          return res.json({
            error: "Truck Repair Info update failed in db.",
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

        //Reduce the number of repair as this record is being deleted for the truck.
        if(repairTruck.truckNumber.numberOfRepairs > 0)
        {
          repairTruck.truckNumber.numberOfRepairs -= 1;
        }

        await this.#dataSource.manager.remove(repairTruck);
        
        res.status(200);
        return res.json({
          success:`Repair Record for TruckNumber: ${repairTruck.truckNumber.truckNumber} has been successfully removed from the database.`
        });
        });

        //Update Repair using id
        this.#express.put("/repairTruck/:id",async (req, res) => {
          const { body } = req;

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

          repairTruck.truckNumber = truck;
          repairTruck.mechanicName = mechanic;
          repairTruck.daysOfRepair = parseInt(body.daysOfRepair);

          try {
            await this.#dataSource.manager.save(repairTruck);
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
              truckNumber:repairTruck.truckNumber,
              mechanicName:repairTruck.mechanicName,
              daysOfRepair:repairTruck.daysOfRepair
             })
          });
    }
  }