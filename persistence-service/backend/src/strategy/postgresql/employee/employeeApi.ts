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

      this.#express.get("/employee/:employeeId", async (req, res) => {

        const employee = await this.#dataSource.manager.findBy(Employee, {
          employeeId: parseInt(req.params.employeeId),
        })

        if(employee == null)
        {
          res.status(503);
          return res.json({
            error:"Employee with the id not found"
          })
        }
        res.status(200);
        return res.json({
          employee
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
          category:employee.category
        });
      });

        //Delete Employee using employeeId
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

        return res.json(   
          await this.#dataSource.manager.remove(employee),
          );
      });

      //Update Employee using employeeId
      this.#express.put("/employee/:employeeId",async (req, res) => {
        const { body } = req;
        // //IF EMPLOYEE IS NOT FOUND.
        // if(employee == null)
        // {
        //   res.status(503);
        //   return res.json({
        //     error: "Employee with the entered id not found!"
        //   })
        // }

        try{
          await this.#dataSource.manager.update(Employee, parseInt(req.params.employeeId), {firstName:body.firstName, lastName:body.lastName, seniority:body.seniority});
        }
        catch(err)
        {
          res.status(503);
          return res.json({
            error: "Employee Update failed in db. (Maybe employee with the given id not found",
          });
        }
       
        res.status(200);
        return res.json({
         error:'Employee Successfully updated.'
        });
    });
  }
}