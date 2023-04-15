import { Express } from "express";
import { DataSource } from "typeorm";
import { Mechanic } from "./mechanic";
import { parse } from "path";
import { request } from "http";
import { Employee } from "../employee";
import { EmployeeCategory } from "../employeeCategory";
import { Truck } from "../truck";
import { parseArgs } from "util";

export default class MechanicApi {
    #dataSource: DataSource;
    #express: Express;
    
    constructor(dataSource: DataSource, express: Express) {
      this.#dataSource = dataSource;
      this.#express = express;

      //DECLARED A GLOBAL VARIABLE TO USE ALL OVER THE FILE.
      var truckBrandName = "none";
      //Add/Update brand specialization
      this.#express.put("/mechanic/:employeeId", async (req, res) => {
        const { body } = req;
        console.log(body);
        
        //GET THE MECHANIC WHOSE ID IS THE EMPLOYEE ID
        const mechanic = await this.#dataSource.manager.findOneBy(Mechanic, {
          employeeId: parseInt(req.params.employeeId),
        });

        if(mechanic == null)
        {
          res.status(503);
          return res.json({
            error:"No mechanic employee found with the given employee Id."
          })
        }
        
        if(mechanic.brandSpecialization == null)
        {
          console.log("Truck Brand is empty");
        }

        const employee = await this.#dataSource.manager.findOneBy(Employee,{
          employeeId:parseInt(req.params.employeeId),
        });

        if(employee == null)
        {
          res.status(503);
          return res.json({
            error:"No employee found with the given employee Id."
          })
        }


        //IF A BRAND NAME HAS BEEN PASSED IN THE BODY.
        if(body.truckBrand != null)
        {
          const truck = await this.#dataSource.manager.findOneBy(Truck,{
            truckBrand:body.truckBrand.toString(),});
  
          console.log(truck);
  
          if(truck == null)
          {
            res.status(503);
            return res.json({
              error:"No such truck is found in the database with the given truck brand."
            })
          }
          truckBrandName = truck.truckBrand;
          console.log(truckBrandName);
          try 
          {
            await this.#dataSource.manager.update(Mechanic,mechanic.id, {brandSpecialization:truck});
            console.log(`Mechanic has been updated}`);
          } 
          catch (err) 
          {
            res.status(503);
            return res.json({
              error: "Mechanic Update failed in db.",
            });
          }
        }

        //IF NULL HAS BEEN PASSED IN BRANDNAME
        else{
          truckBrandName = "none";
          try 
          {
            await this.#dataSource.manager.update(Mechanic,mechanic.id, {brandSpecialization:null});
            console.log(`Mechanic has been updated}`);
          } 
          catch (err) 
          {
            res.status(503);
            return res.json({
              error: "Mechanic Update failed in db.",
            });
          }
        }

        res.status(200);
        return res.json({
          mechanicId:mechanic.id,
          employeeId:mechanic.employeeId,
          brandSpecialization:truckBrandName,
          success:"Brand Specialization Successfully added for the mechanic."
        });
      });

      //Get a mechanic and their details
      this.#express.get("/mechanic/:employeeId", async (req, res) => {
        const employee = await this.#dataSource.manager.findOneBy(Employee, {
          employeeId: parseInt(req.params.employeeId),
        });

        const mechanic = await this.#dataSource.manager.findOneBy(Mechanic, {
          employeeId: parseInt(req.params.employeeId),
        });

        if(employee == null)
        {
          res.status(503);
          return res.json({
            error:"Employee Not Found with the given Id.",
          })
        }

        if(mechanic == null)
        {
          res.status(503);
          return res.json({
            error:"Mechanic Employee Not Found with the given Id.",
          })
        }

        res.status(200);
        return res.json({
          mechanicId:mechanic.id,
          employeeId:employee.employeeId,
          employeeFirstName:employee.firstName,
          employeeLastName:employee.lastName,
          employeeSeniority:employee.seniority,
          employeeCategory:employee.category,
          brandSpecialization:truckBrandName
        });
      });
  
      //Delete Mechanic using employeeId (Also deletes from employee and employee category automatically which are mechanics)
      this.#express.delete("/mechanic/:employeeId",async (req, res) => {
        const employee =  await this.#dataSource.manager.findOneBy(Employee, {employeeId: parseInt(req.params.employeeId),});
        if(employee == null)
        {
          res.status(503);
          return res.json({
            error:"Employee not found of the given ID"
          });
        }

        const employeeCategory =  await this.#dataSource.manager.findOneBy(EmployeeCategory, {employeeId: parseInt(req.params.employeeId),});
        if(employeeCategory == null)
        {
          res.status(503);
          return res.json({
            error:"Employee Category not found of the given ID"
          });
        }

        const mechanic = await this.#dataSource.manager.findOneBy(Mechanic, {
          employeeId: parseInt(req.params.employeeId),
        });

        await this.#dataSource.manager.remove(mechanic);
        await this.#dataSource.manager.remove(employeeCategory);
        await this.#dataSource.manager.remove(employee);

        res.status(200);
        return res.json({
          success:'Mechanic and its associated entities removed successfully.'
        });
      });
    }

    
  }