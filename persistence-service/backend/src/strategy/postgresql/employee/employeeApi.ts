import { Express } from "express";
import { DataSource, IsNull } from "typeorm";
import { Employee } from "./employee";
import { EmployeeCategory } from "../employeeCategory";
import { json } from "stream/consumers";
import { Driver } from "../driver";
import { Mechanic } from "../mechanic";
import { error } from "console";

export default class EmployeeApi {
    #dataSource: DataSource;
    #express: Express;
  
    constructor(dataSource: DataSource, express: Express) {
      this.#dataSource = dataSource;
      this.#express = express;

      this.#express.get("/employee/dropDatabase", async(_,res)=>{
        return res.json(
          this.#dataSource.dropDatabase()
        )
      })


      //GET AN EMPLOYEE
      this.#express.get("/employee/:employeeId", async (req, res) => {

        const employee = await this.#dataSource.manager.findBy(Employee, {
          employeeId: parseInt(req.params.employeeId),
        })

        if(employee.length <= 0)
        {
          res.status(503);
          return res.json({
            error:"Employee with the id not found"
          })
        }
        res.status(200);
        return res.json({
          employeeId:employee[0].employeeId,
          employeeFirstName:employee[0].firstName,
          employeeLastName:employee[0].lastName,
          employeeSeniority:employee[0].seniority,
          employeeCategory:employee[0].category
        })
      });
  

      //INSERT AN EMPLOYEE
      this.#express.post("/employee", async (req, res) => {
        const { body } = req;
        console.log(body);
  
        const employee = new Employee();
  
        employee.firstName = body.firstName;
        employee.lastName = body.lastName;
        employee.seniority = body.seniority;
        employee.category = body.category;

        //IF USER ENTER ANYTHING OTHER THAN DRIVER OR MECHANIC
        if(employee.category.toLowerCase() != "driver" && employee.category.toLowerCase() != "mechanic" )
        {
          res.status(503);
          return res.json({
            error: "Please enter a valid category for the employee.(Driver or Mechanic)",
          });
        }
  
        try {
          await this.#dataSource.manager.save(employee);
          console.log(`Employee has been created with the employee id: ${employee.employeeId}`);
        } catch (err) {
          res.status(503);
          return res.json({
            error: "Employee creation failed in db.",
          });
        }
        //WE WILL AUTOMATICALLY CREATE A CATEGORY FOR THE CURRENT EMPLOYEE CREATED WHICH WILL BE MONITORED IN THE EMPLOYEECATEGORY TABLE AS WELL.
        const employeeCategory = new EmployeeCategory();
        employeeCategory.employeeId = employee.employeeId;
        employeeCategory.category = employee.category;

        try {
          await this.#dataSource.manager.save(employeeCategory);
          console.log(`Employee Category has been created with the employee id: ${employee.employeeId}`);
        } catch (err) {
          res.status(503);
          return res.json({
            error: "Employee Category creation failed in db.",
          });
        }

        if(employeeCategory.category.toLowerCase() == "driver")
        {
          const driver = new Driver();
          driver.employeeId = employee.employeeId;
          try {
            await this.#dataSource.manager.save(driver);
            console.log(`Driver has been created with the employee id: ${employee.employeeId}`);
          } catch (err) {
            res.status(503);
            return res.json({
              error: "Driver creation failed in db.",
            });
          }
  
        }
        else if(employeeCategory.category.toLowerCase() == "mechanic")
        {
          const mechanic = new Mechanic();
          mechanic.employeeId = employee.employeeId;
          mechanic.brandSpecialization = null;  //Keep it empty initially. There is a add brand specialization method in mechanic api
          try {
            await this.#dataSource.manager.save(mechanic);
            console.log(`Mechanic has been created with the employee id: ${employee.employeeId}`);
          } catch (err) {
            res.status(503);
            return res.json({
              error: "Mechanic creation failed in db.",
            });
          }
        }

        res.status(200);
        return res.json({
          employeeId: employee.employeeId,
          firstName: employee.firstName,
          lastName:employee.lastName,
          seniority:employee.seniority,
          category:employee.category,
          success:"Employee successfully added."
        });
      });

      //DELETE AN EMPLOYEE AND ITS ASSOCIATED ENTITIES
        this.#express.delete("/employee/:employeeId",async (req, res) => {

        const employee = await this.#dataSource.manager.findOneBy(Employee, {
          employeeId: parseInt(req.params.employeeId),
        });

        //IF EMPLOYEE IS NOT FOUND.
        if(employee == null)
        {
          res.status(503);
          return res.json({
            error: "Employee with the entered id not found!"
          })
        }

        const employeeCategory = await this.#dataSource.manager.findOneBy(EmployeeCategory, {
          employeeId: parseInt(req.params.employeeId),
        });

        await this.#dataSource.manager.remove(employeeCategory);  //Removes the employee category too

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

        await this.#dataSource.manager.remove(employee);

        return res.json({
          success:'Employee and its associated entities successfully removed from the db.'
        });
      });

      //UPDATE AN EMPLOYEE AND ITS ASSOCIATED ENTITIES
      this.#express.put("/employee/:employeeId",async (req, res) => {
        const { body } = req;

        //FETCH EMPLOYEE
        const employee = await this.#dataSource.manager.findBy(Employee, {
          employeeId: parseInt(req.params.employeeId),
        });

        if(employee.length <= 0)
        {
          res.status(503);
          return res.json({
            error:"Employee/Employee Category not found of the given ID"
          });
        }

         //FETCH EMPLOYEE CATEGORY
         const employeeCategory =  await this.#dataSource.manager.findBy(EmployeeCategory, {employeeId: parseInt(req.params.employeeId),});
         if(employeeCategory.length <= 0)
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

        //IF NEW CATEGORY IS MECHANIC AND OLD CATEGORY IS DRIVER.
        if(body.category.toLowerCase() == "mechanic" && employeeCategory[0].category.toLowerCase() == "driver" && mechanic == null)
        {
          await this.#dataSource.manager.remove(driver);
          const newMechanic = new Mechanic();
          newMechanic.brandSpecialization = null;
          newMechanic.employeeId = employee[0].employeeId;

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
        else if(body.category.toLowerCase() == "driver" && employeeCategory[0].category.toLowerCase() == "mechanic" && driver == null)
        {
          await this.#dataSource.manager.remove(mechanic);
          const newDriver = new Driver();
          newDriver.employeeId = employee[0].employeeId;

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


        employee[0].firstName = body.firstName;
        employee[0].lastName = body.lastName;
        employee[0].seniority = body.seniority;
        employee[0].category = body.category;
        employeeCategory[0].category = body.category;

        //SAVE/UPDATE EMPLOYEE TO DATABASE
        try
        {
          await this.#dataSource.manager.save(employee[0]);
        }
        catch(err)
        {
          res.status(503);
          return res.json({
            error: "Employee Update failed in db. (Maybe employee with the given id not found",
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
          employeeId:employee[0].employeeId,
          employeeFirstName:employee[0].firstName,
          employeeLastName:employee[0].lastName,
          employeeSeniority:employee[0].seniority,
          employeeCategory:employee[0].category,
          success:'Employee Successfully updated.'
        });
    });
  }
}