import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Employee } from "../employee/employee";
import { Truck } from "../truck";

@Entity()
export class Mechanic {
  @PrimaryGeneratedColumn()
  id:number;             

  @OneToOne(()=>Employee, {onDelete:'CASCADE'})
  @JoinColumn()
  employeeId:Employee['employeeId'];    //EmployeeID foreign key

  @ManyToOne(()=>Truck, {nullable:true, onDelete:'CASCADE'})
  @JoinColumn()
  brandSpecialization:Truck|null;   //Truck Brand Foreign Key //Is null initially
}