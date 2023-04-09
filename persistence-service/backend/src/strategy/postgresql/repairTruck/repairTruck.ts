import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { Truck } from "../truck";
import { Employee } from "../employee";

@Entity()
export class RepairTruck {
  @PrimaryGeneratedColumn()
  id:number;             

  @OneToOne(()=>Truck)
  @JoinColumn()
  truckNumber:Truck['truckNumber'];

  //FirstName of employee who is mechanic 
  @OneToOne(()=>Employee,{nullable:true})
  @JoinColumn()
  mechanicName:Employee['firstName'];

  @Column()
  daysOfRepair:number;
}