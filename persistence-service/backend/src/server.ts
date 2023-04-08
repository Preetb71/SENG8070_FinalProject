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

(async () => {
  const app = express();
  app.use(cors());
  app.use(json());

  const datasource = await postgresDataSource.initialize();

  new PhotoApi(datasource, app);
  app.get("/", (_, res) => {
    return res.send("hello world");
  });

  new EmployeeApi(datasource, app);
  app.get("/", (_, res) => {
    return res.send("hello world");
  });

  new EmployeeCategoryApi(datasource, app);
  app.get("/", (_, res) => {
    return res.send("hello world");
  });

  new DriverApi(datasource, app);
  app.get("/", (_, res) => {
    return res.send("hello world");
  });

  new TruckApi(datasource, app);
  app.get("/", (_, res) => {
    return res.send("hello world");
  });

  new MechanicApi(datasource, app);
  app.get("/", (_, res) => {
    return res.send("hello world");
  });

  new TruckTripApi(datasource, app);
  app.get("/", (_, res) => {
    return res.send("hello world");
  });

  new CustomerApi(datasource, app);
  app.get("/", (_, res) => {
    return res.send("hello world");
  });

  app.listen(8000, () => {
    console.log(`express server started on 8000`);
  }); 
})().catch((err) => console.log(err));
