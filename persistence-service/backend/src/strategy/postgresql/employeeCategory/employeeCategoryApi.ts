import { Express } from "express";
import { DataSource } from "typeorm";
import { EmployeeCategory } from "./employeeCategory";
import { parse } from "path";
import { request } from "http";
import { Employee } from "../employee/employee";
import { error } from "console";
import { Driver } from "../driver";
import { Mechanic } from "../mechanic";

export default class EmployeeCategoryApi {
    #dataSource: DataSource;
    #express: Express;
  
    constructor(dataSource: DataSource, express: Express) {
      this.#dataSource = dataSource;
      this.#express = express;
  
      //Get a employee's category
      this.#express.get("/employeeCategory/:employeeId", async (req, res) => {
        const employee =  await this.#dataSource.manager.findOneBy(Employee, {employeeId: parseInt(req.params.employeeId),});
        if(employee == null)
        {
          res.status(503);
          return res.json({
            error:"Employee/Employee Category not found of the given ID"
          });
        }
        res.status(200);
        return res.json({
          employeeId:employee.employeeId,
          employeeFirstName:employee.firstName,
          employeeLastName:employee.lastName,
          employeeCategory:employee.category
        });
      });

      //Delete Category using employeeId, Also deletes from employee table and drivers or mechanic table
      this.#express.delete("/employeeCategory/:employeeId",async (req, res) => {

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

         //REMOVE DRIVER OR MECHANIC DATA FOR THE CURRENT EMPLOYEE THAT IS BEING DELETED
         if(employee.category.toLowerCase() == "driver")
         {
           const driver = await this.#dataSource.manager.findOneBy(Driver, {
             employeeId: parseInt(req.params.employeeId),
           });
 
           await this.#dataSource.manager.remove(driver);
         }
         else if(employee.category.toLowerCase() == "mechanic")
         {
           const mechanic = await this.#dataSource.manager.findOneBy(Mechanic, {
             employeeId: parseInt(req.params.employeeId),
           });
 
           await this.#dataSource.manager.remove(mechanic);
         }

        await this.#dataSource.manager.remove(employeeCategory);
        await this.#dataSource.manager.remove(employee);
        res.status(200);
        return res.json({
          success:'Employee Category and its associated entities removed successfully.'
        });
      })

      //Update Category using employeeId
      this.#express.put("/employeeCategory/:employeeId",async (req, res) => {
        const { body } = req;

        //FETCH EMPLOYEE
        const employee =  await this.#dataSource.manager.findOneBy(Employee, {employeeId: parseInt(req.params.employeeId),});
        if(employee == null)
        {
          res.status(503);
          return res.json({
            error:"Employee/Employee Category not found of the given ID"
          });
        }

        //FETCH EMPLOYEE CATEGORY
        const employeeCategory =  await this.#dataSource.manager.findOneBy(EmployeeCategory, {employeeId: parseInt(req.params.employeeId),});
        if(employeeCategory == null)
        {
          res.status(503);
          return res.json({
            error:"Employee Category not found of the given ID"
          });
        }

        //FETCH DRIVER ENTITY (CAN BE NULL IF THE EXISTING CATEGORY IS MECHANIC)
        const driver = await this.#dataSource.manager.findOneBy(Driver, {
          employeeId: parseInt(req.params.employeeId),
        });

        //FETCH MECHANIC ENTITY (CAN BE NULL IF THE EXISTING CATEGORY IS DRIVER)
        const mechanic = await this.#dataSource.manager.findOneBy(Mechanic, {
          employeeId: parseInt(req.params.employeeId),
        });

        if((body.category.toLowerCase() == "driver" && employeeCategory.category.toLowerCase() == "driver")|| (body.category.toLowerCase() == "mechanic" && employeeCategory.category.toLowerCase() == "mechanic"))
        {        
          //Dont change anything, as the user has passed in the same category name.
          res.status(200);
          return res.json({
            success:"Employee Category and its associated entities updated successfully."
          })
        }

        //IF NEW CATEGORY IS MECHANIC AND OLD CATEGORY IS DRIVER.
        if(body.category.toLowerCase() == "mechanic" && employeeCategory.category.toLowerCase() == "driver" && mechanic == null)
        {
          await this.#dataSource.manager.remove(driver);
          const newMechanic = new Mechanic();
          newMechanic.brandSpecialization = null;
          newMechanic.employeeId = employee.employeeId;

          //SAVE MECHANIC TO DATABASE
          try {
            await this.#dataSource.manager.save(newMechanic);
            console.log(`Mechanic has been created}`);
          } catch (err) {
            res.status(503);
            return res.json({
              error: "Mechanic creation failed in db.",
            });
          }
        }

         //IF NEW CATEGORY IS DRIVER AND OLD CATEGORY IS MECHANIC.
        if(body.category.toLowerCase() == "driver" && employeeCategory.category.toLowerCase() == "mechanic" && driver == null)
        {
          await this.#dataSource.manager.remove(mechanic);
          const newDriver = new Driver();
          newDriver.employeeId = employee.employeeId;

          //SAVE MECHANIC TO DATABASE
          try {
            await this.#dataSource.manager.save(newDriver);
            console.log(`Driver has been created}`);
          } catch (err) {
            res.status(503);
            return res.json({
              error: "Driver creation failed in db.",
            });
          }
        }

        //UPDATE THE CATEGORY IN EMPLOYEE AND EMPLOYEE CATEGORY ENTITIES.
        employee.category = body.category;
        employeeCategory.category = body.category;

           //SAVE/UPDATE EMPLOYEE TO DATABASE
           try {
            await this.#dataSource.manager.save(employee);
            console.log(`Employee has been updated}`);
          } catch (err) {
            res.status(503);
            return res.json({
              error: "Employee update failed in db.",
            });
          }

          //SAVE/UPDATE EMPLOYEE CATEGORY TO DATABASE
          try {
            await this.#dataSource.manager.save(employeeCategory);
            console.log(`Employee Category has been updated}`);
          } catch (err) {
            res.status(503);
            return res.json({
              error: "Employee Category Update failed in db.",
            });
          }

          res.status(200);
          return res.json({
            employeeId:employee.employeeId,
            employeeCategory:employee.category,
            employeeCategoryId:employeeCategory.id,
            success:"Employee Category and its associated entities updated successfully."
          })
        });
  }

    
  }