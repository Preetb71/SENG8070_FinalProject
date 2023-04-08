import { Express } from "express";
import { DataSource } from "typeorm";
import { Customer } from "./customer";

export default class CustomerApi {
    #dataSource: DataSource;
    #express: Express;
  
    constructor(dataSource: DataSource, express: Express) {
      this.#dataSource = dataSource;
      this.#express = express;

      this.#express.get("/customer/:customerId", async (req, res) => {
        return res.json(
          await this.#dataSource.manager.findBy(Customer, {
            customerId: parseInt(req.params.customerId),
          })
        );
      });
  
      this.#express.post("/customer", async (req, res) => {
        const { body } = req;
        console.log(body);
  
        const customer = new Customer();
        customer.customerName = body.customerName;
        customer.customerAddress = body.customerAddress;
        customer.customerPhoneNumberOne = body.customerPhoneNumberOne;
        customer.customerPhoneNumberTwo = body.customerPhoneNumberTwo;
        
        try {
          await this.#dataSource.manager.save(customer);
          console.log(`Customer has been created with the customer id: ${customer.customerId}`);
        } catch (err) {
          res.status(503);
          return res.json({
            error: "Customer creation failed in db.",
          });
        }

        res.status(200);
        return res.json({
          customerId: customer.customerId,
        });
      });

       //Delete Customer using customerId
       this.#express.delete("/customer/:customerId",async (req, res) => {

        return res.json(   
          await this.#dataSource.manager.createQueryBuilder()
          .delete().from(Customer)
          .where("customerId = :customerId", {customerId:parseInt(req.params.customerId)})
          .execute(),
          );
        });

          //Update Customer using customerId
          this.#express.put("/customer/:customerId",async (req, res) => {
            const { body } = req;
            return res.json(   
              await this.#dataSource.manager.createQueryBuilder()
              .update(Customer)
              .set({
                customerName:body.customerName,
                customerAddress:body.customerAddress,
                customerPhoneNumberOne:body.customerPhoneNumberOne,
                customerPhoneNumberTwo:body.customerPhoneNumberTwo
            })
              .where("customerId = :customerId", {customerId:parseInt(req.params.customerId)})
              .execute(),
              );
            });
    }
  }