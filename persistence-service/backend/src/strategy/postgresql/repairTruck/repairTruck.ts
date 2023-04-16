import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, OneToMany, ManyToMany, ManyToOne } from "typeorm";
import { Truck } from "../truck";
import { Mechanic } from "../mechanic";

@Entity()
export class RepairTruck {
  @PrimaryGeneratedColumn()
  id:number;             

  @ManyToOne(()=>Truck, {nullable:true,onDelete:'CASCADE'})
  @JoinColumn()
  truck:Truck | null;

  //FirstName of employee who is mechanic 
  @ManyToOne(()=>Mechanic, {nullable:true, onDelete:'CASCADE'})
  @JoinColumn()
  mechanic:Mechanic|null;

  @Column()
  daysOfRepair:number;
}