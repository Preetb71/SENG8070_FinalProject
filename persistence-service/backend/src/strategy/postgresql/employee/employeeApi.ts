import { Express } from "express";
import { DataSource, Equal, IsNull } from "typeorm";
import { Employee } from "./employee";
import { EmployeeCategory } from "../employeeCategory";
import { json } from "stream/consumers";
import { Driver } from "../driver";
import { Mechanic } from "../mechanic";
import { error } from "console";
import { TruckTrip } from "../truckTrip";
import { RepairTruck } from "../repairTruck";

export default class EmployeeApi {
    #dataSource: DataSource;
    #express: Express;
  
    constructor(dataSource: DataSource, express: Express) {
      this.#dataSource = dataSource;
      this.#express = express;

      this.#express.get("/dropDatabase", async(_,res)=>{
        await this.#dataSource.dropDatabase();
        await this.#dataSource.destroy();
        await this.#dataSource.initialize();
        return res.send("Database has been successfully reset.")
      })


      //GET AN EMPLOYEE
      this.#express.get("/employee/:employeeId", async (req, res) => {

        const employee = await this.#dataSource.manager.findOneBy(Employee, {
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
          employeeId:employee.employeeId,
          employeeFirstName:employee.firstName,
          employeeLastName:employee.lastName,
          employeeSeniority:employee.seniority,
          employeeCategory:employee.category
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


        //REMOVE DRIVER OR MECHANIC DATA FOR THE CURRENT EMPLOYEE THAT IS BEING DELETED
        if(employee.category.toLowerCase() == "driver")
        {
          const driver = await this.#dataSource.manager.findOneBy(Driver, {
            employeeId: parseInt(req.params.employeeId),
          });

          //#region THIS WILL REMOVE THE DRIVER REFERENCES FROM ANY TRUCK TRIP THAT HAS THEM ASSIGNED.

          if(driver != null)
          {
            const truckTripDriverOne = await this.#dataSource.manager.find(TruckTrip, {
              relations:{driverOne :true},
              where:{
                driverOne:{
                  employeeId:driver.employeeId
                }
              }
            });
  
            // const truckTripDriverOne = await this.#dataSource.manager.findBy(TruckTrip, {
            //   driverOne: Equal(driver),
            // });
            
            
            if(truckTripDriverOne.length > 0)
            {
              for(let i= 0; i<truckTripDriverOne.length; i++)
              {
                if(truckTripDriverOne[i] != null)
                {
                    // truckTripDriverOne[i].driverOne = null;
                  await this.#dataSource.manager.update(TruckTrip, {tripId:truckTripDriverOne[i].tripId}, {driverOne:null} )
                  // await this.#dataSource.manager.save(truckTripDriverOne[i]);
                }
              }
            }
  
            // const truckTripDriverTwo = await this.#dataSource.manager.findBy(TruckTrip, {
            //   driverTwo: Equal(driver),
            // });
            const truckTripDriverTwo = await this.#dataSource.manager.find(TruckTrip, {
              where:{
                driverTwo:{
                  employeeId:driver.employeeId
                }
              }
            });
    
            
            if(truckTripDriverTwo.length > 0)
            {
              for(let i= 0; i<truckTripDriverTwo.length; i++)
              {
                if(truckTripDriverTwo[i] != null)
                {
                    // truckTripDriverTwo[i].driverTwo = null;
                    // await this.#dataSource.manager.save(truckTripDriverTwo[i]);
                    await this.#dataSource.manager.update(TruckTrip, {tripId:truckTripDriverTwo[i].tripId}, {driverTwo:null} )
                }
              }
            }
            //#endregion THIS WILL REMOVE THE DRIVER REFERENCES FROM ANY TRUCK TRIP THAT HAS THEM ASSIGNED.
          }

          await this.#dataSource.manager.remove(driver);
        }
        else if(employee.category.toLowerCase() == "mechanic")
        {
          const mechanic = await this.#dataSource.manager.findOneBy(Mechanic, {
            employeeId: parseInt(req.params.employeeId),
          });

          //#region THIS WILL REMOVE THE MECHANIC REFERENCES FROM ANY REPAIR TRUCK RECORDS THAT HAS THEM ASSIGNED.
            const repairTruckWithMechanic = await this.#dataSource.manager.findBy(RepairTruck, {
              mechanic: Equal(mechanic),
            });
            
            //If MechanicReference IS FOUND.
            if(repairTruckWithMechanic.length > 0)
            {
              for(let i= 0; i<repairTruckWithMechanic.length; i++)
              {
                // repairTruckWithMechanic[i].mechanicName = null;
                // await this.#dataSource.manager.save(repairTruckWithMechanic[i]);
                await this.#dataSource.manager.update(RepairTruck, {id:repairTruckWithMechanic[i].id}, {mechanic:null} )
              }
            }

          //#endregion THIS WILL REMOVE THE MECHANIC REFERENCES FROM ANY REPAIR TRUCK RECORDS THAT HAS THEM ASSIGNED.

          await this.#dataSource.manager.remove(mechanic);
        }
        
        await this.#dataSource.manager.remove(employeeCategory);  //Removes the employee category too

        await this.#dataSource.manager.remove(employee);

        return res.json({
          success:'Employee and its associated entities successfully removed from the db.'
        });
      });

      //UPDATE AN EMPLOYEE AND ITS ASSOCIATED ENTITIES
      this.#express.put("/employee/:employeeId",async (req, res) => {
        const { body } = req;

        //FETCH EMPLOYEE
        const employee = await this.#dataSource.manager.findOneBy(Employee, {
          employeeId: parseInt(req.params.employeeId),
        });

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

        //IF NEW CATEGORY IS MECHANIC AND OLD CATEGORY IS DRIVER.
        if(body.category.toLowerCase() == "mechanic" && employeeCategory.category.toLowerCase() == "driver" && mechanic == null)
        {
          //#region THIS WILL REMOVE THE DRIVER REFERENCES FROM ANY TRUCK TRIP THAT HAS THEM ASSIGNED.
          const truckTripDriverOne = await this.#dataSource.manager.find(TruckTrip, {
            where:{
              driverOne:{
                employeeId:driver?.employeeId
              }
            }
          });
          
          
          if(truckTripDriverOne.length > 0)
          {
            for(let i= 0; i<truckTripDriverOne.length; i++)
            {
              // truckTripDriverOne[i].driverOne = null;
              // await this.#dataSource.manager.save(truckTripDriverOne[i]);
              await this.#dataSource.manager.update(TruckTrip, {tripId:truckTripDriverOne[i].tripId}, {driverOne:null} )
            }
          }

          const truckTripDriverTwo = await this.#dataSource.manager.find(TruckTrip, {
            where:{
              driverTwo:{
                employeeId:driver?.employeeId
              }
            }
          });
  
          
          if(truckTripDriverTwo.length > 0)
          {
            for(let i= 0; i<truckTripDriverTwo.length; i++)
            {
              // truckTripDriverTwo[i].driverTwo = null;
              // await this.#dataSource.manager.save(truckTripDriverTwo[i]);
              await this.#dataSource.manager.update(TruckTrip, {tripId:truckTripDriverTwo[i].tripId}, {driverTwo:null} )
            }
          }
          //#endregion THIS WILL REMOVE THE DRIVER REFERENCES FROM ANY TRUCK TRIP THAT HAS THEM ASSIGNED.

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
        else if(body.category.toLowerCase() == "driver" && employeeCategory.category.toLowerCase() == "mechanic" && driver == null)
        {

           //#region THIS WILL REMOVE THE MECHANIC REFERENCES FROM ANY REPAIR TRUCK RECORDS THAT HAS THEM ASSIGNED.
           const repairTruckWithMechanic = await this.#dataSource.manager.find(RepairTruck, {
            where:{
              mechanic:{
                employeeId:mechanic?.employeeId
              }
            }
          });
          
          //If MechanicReference IS FOUND.
          if(repairTruckWithMechanic.length > 0)
          {
            for(let i= 0; i<repairTruckWithMechanic.length; i++)
            {
              // repairTruckWithMechanic[i].mechanicName = null;
              // await this.#dataSource.manager.save(repairTruckWithMechanic[i]);
              await this.#dataSource.manager.update(RepairTruck, {id:repairTruckWithMechanic[i].id}, {mechanic:null} )
            }
          }

        //#endregion THIS WILL REMOVE THE MECHANIC REFERENCES FROM ANY REPAIR TRUCK RECORDS THAT HAS THEM ASSIGNED.

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

        employee.firstName = body.firstName;
        employee.lastName = body.lastName;
        employee.seniority = body.seniority;
        employee.category = body.category;
        employeeCategory.category = body.category;

        //SAVE/UPDATE EMPLOYEE TO DATABASE
        try
        {
          await this.#dataSource.manager.save(employee);
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
          employeeId:employee.employeeId,
          employeeFirstName:employee.firstName,
          employeeLastName:employee.lastName,
          employeeSeniority:employee.seniority,
          employeeCategory:employee.category,
          success:'Employee Successfully updated.'
        });
    });
  }
}