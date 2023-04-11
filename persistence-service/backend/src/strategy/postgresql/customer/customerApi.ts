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
        const customer =  await this.#dataSource.manager.findOneBy(Customer, {
          customerId: parseInt(req.params.customerId),
        });

        if(customer == null)
        {
          res.status(503);
          return res.json({error:"No customer found with the given id."});
        }

        res.status(200);
        return res.json({
          customerId:customer.customerId,
          customerName:customer.customerName,
          customerAddress:customer.customerAddress,
          customerPhoneNumberOne:customer.customerPhoneNumberOne,
          customerPhoneNumberTwo:customer.customerPhoneNumberTwo
        });
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
          customerName:customer.customerName,
          customerAddress:customer.customerAddress,
          customerPhoneNumberOne:customer.customerPhoneNumberOne,
          customerPhoneNumberTwo:customer.customerPhoneNumberTwo
        });
      });

       //Delete Customer using customerId
       this.#express.delete("/customer/:customerId",async (req, res) => {

        const customer = await this.#dataSource.manager.findOneBy(Customer,{
          customerId:parseInt(req.params.customerId),
        })

        if(customer == null)
        {
          res.status(503);
          return res.json({
            error:"No customer found by the given id."
          })
        }

        await this.#dataSource.manager.remove(customer);

        res.status(200);
        return res.json
        ({
            success:"Customer successfully removed from the db."
          });
        });

        //Update Customer using customerId
        this.#express.put("/customer/:customerId",async (req, res) => {
          const { body } = req;

          const customer = await this.#dataSource.manager.findOneBy(Customer,{
            customerId:parseInt(req.params.customerId),
          })
  
          if(customer == null)
          {
            res.status(503);
            return res.json({
              error:"No customer found by the given id."
            })
          }

          customer.customerName = body.customerName;
          customer.customerAddress = body.customerAddress;
          customer.customerPhoneNumberOne = body.customerPhoneNumberOne;
          customer.customerPhoneNumberTwo = body.customerPhoneNumberTwo;

          await this.#dataSource.manager.save(customer);

          res.status(200);
          return res.json({
            customerId:customer.customerId,
            customerName:customer.customerName,
            customerAddress:customer.customerAddress,
            customerPhoneNumberOne:customer.customerPhoneNumberOne,
            customerPhoneNumberTwo:customer.customerPhoneNumberTwo,
            success:"Customer successfully updated."
          });
        });
    }
  }