import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";
import { Employee } from "../employee/employee";

@Entity()
export class EmployeeCategory {
  @PrimaryGeneratedColumn()
  id:number;             

  @OneToOne(()=>Employee, {onDelete:'CASCADE'})
  @JoinColumn()
  employeeId:Employee['employeeId'];    //EmployeeID foreign key

  @Column()
  category:string;

}