import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { Truck } from "../truck";
import { Mechanic } from "../mechanic";

@Entity()
export class RepairTruck {
  @PrimaryGeneratedColumn()
  id:number;             

  @OneToOne(()=>Truck)
  @JoinColumn()
  truckNumber:Truck;

  //FirstName of employee who is mechanic 
  @OneToOne(()=>Mechanic)
  @JoinColumn()
  mechanicName:Mechanic;

  @Column()
  daysOfRepair:number;
}