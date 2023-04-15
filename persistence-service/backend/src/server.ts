import cors from "cors";
import express, { json } from "express";
import postgresDataSource from "./strategy/postgresql";
import PhotoApi from "./strategy/postgresql/photo";
import EmployeeApi from "./strategy/postgresql/employee";
import EmployeeCategoryApi from "./strategy/postgresql/employeeCategory";
import DriverApi from "./strategy/postgresql/driver/driverApi";
import TruckApi from "./strategy/postgresql/truck/truckApi";
import MechanicApi from "./strategy/postgresql/mechanic/mechanicApi";
import TruckTripApi from "./strategy/postgresql/truckTrip/truckTripApi";
import CustomerApi from "./strategy/postgresql/customer/customerApi";
import RepairTruckApi from "./strategy/postgresql/repairTruck/repairTruckApi";
import ShipmentApi from "./strategy/postgresql/shipment/shipmentApi";
import { createConnection } from "net";

(async () => {
  const app = express();
  app.use(cors());
  app.use(json());

  const datasource = await postgresDataSource.initialize();

  //THIS WILL RESET THE DATABASE WHENEVER NEEDED.
  app.get("/resetdatabase", async(_,res)=>{
    const entities = datasource.entityMetadatas;
    for(const entity of entities)
    {
        const repository = datasource.getRepository(entity.name) // Get repository
        await repository.clear(); // Clear each entity table's content
    }
    return res.send("Database has been reset successfully.");
  })

  new PhotoApi(datasource, app);
  app.get("/photo", (_, res) => {
    return res.send("hello world, here are your photos.");
  });

  new EmployeeApi(datasource, app);
  app.get("/employee", (_, res) => {
    return res.send("hello world, here are your employees.");
  });

  new EmployeeCategoryApi(datasource, app);
  app.get("/employeeCategory", (_, res) => {
    return res.send("hello world, here are your employee categories.");
  });

  new DriverApi(datasource, app);
  app.get("/driver", (_, res) => {
    return res.send("hello world, here are your drivers.");
  });

  new TruckApi(datasource, app);
  app.get("/truck", (_, res) => {
    return res.send("hello world, here are your trucks.");
  });

  new MechanicApi(datasource, app);
  app.get("/mechanic", (_, res) => {
    return res.send("hello world, here are your mechanics.");
  });

  new TruckTripApi(datasource, app);
  app.get("/truckTrip", (_, res) => {
    return res.send("hello world, here are your truck trips.");
  });

  new CustomerApi(datasource, app);
  app.get("/customer", (_, res) => {
    return res.send("hello world, here are your customers.");
  });

  new RepairTruckApi(datasource, app);
  app.get("/repairTruck", (_, res) => {
    return res.send("hello world, here are your truck repair records.");
  });

  new ShipmentApi(datasource, app);
  app.get("/shipment", (_, res) => {
    return res.send("hello world, here are your shipments.");
  });


  app.listen(8000, () => {
    console.log(`express server started on 8000`);
  }); 

})().catch((err) => console.log(err));
