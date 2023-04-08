import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";
import { Employee } from "../employee/employee";

@Entity()
export class Driver {
  @PrimaryGeneratedColumn()
  id:number;             

  @OneToOne(()=>Employee)
  @JoinColumn()
  employeeId:Employee['employeeId'];    //EmployeeID foreign key
}