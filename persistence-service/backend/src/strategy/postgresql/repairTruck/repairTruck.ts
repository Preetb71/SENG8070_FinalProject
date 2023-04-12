import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, OneToMany, ManyToMany, ManyToOne } from "typeorm";
import { Truck } from "../truck";
import { Mechanic } from "../mechanic";

@Entity()
export class RepairTruck {
  @PrimaryGeneratedColumn()
  id:number;             

  @ManyToOne(()=>Truck)
  @JoinColumn()
  truckNumber:Truck;

  //FirstName of employee who is mechanic 
  @ManyToOne(()=>Mechanic)
  @JoinColumn()
  mechanicName:Mechanic;

  @Column()
  daysOfRepair:number;
}