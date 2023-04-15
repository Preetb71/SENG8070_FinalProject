import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, OneToMany, ManyToOne } from "typeorm";
import { Driver } from "../driver";
import { Truck } from "../truck/truck";

@Entity()
export class TruckTrip {
  @PrimaryGeneratedColumn()
  tripId:number;             

  @Column()
  origin:string;

  @Column()
  destination:string;

  //Driver one for the trip (A trip will have atmost one driver)
  @ManyToOne(()=>Driver, {nullable:true, onDelete:'CASCADE'})
  @JoinColumn()
  driverOne:Driver|null;

  //Driver two for the trip (A trip will have atmost one driver) Driver two can be null here.
  @ManyToOne(()=>Driver,{nullable:true, onDelete:'CASCADE'})
  @JoinColumn()
  driverTwo:Driver|null;

  @Column()
  numberOfShipments:number; //Initially will be zero.

  //Truck Number
  @ManyToOne(()=>Truck, {nullable:true, onDelete:'CASCADE'})
  @JoinColumn()
  truck:Truck | null;
}