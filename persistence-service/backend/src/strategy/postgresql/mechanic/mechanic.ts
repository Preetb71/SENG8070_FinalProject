import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";
import { Employee } from "../employee/employee";
import { Truck } from "../truck";

@Entity()
export class Mechanic {
  @PrimaryGeneratedColumn()
  id:number;             

  @OneToOne(()=>Employee)
  @JoinColumn()
  employeeId:Employee['employeeId'];    //EmployeeID foreign key

  @OneToOne(()=>Truck, {nullable:true})
  @JoinColumn()
  brandSpecialization:Truck['truckBrand']|null   //Truck Brand Foreign Key //Is null initially
}