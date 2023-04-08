import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, OneToMany } from "typeorm";
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
  @OneToOne(()=>Driver)
  @JoinColumn()
  driverOneId:Driver['employeeId'];

  //Driver two for the trip (A trip will have atmost one driver) Driver two can be null here.
  @OneToOne(()=>Driver,{nullable:true})
  @JoinColumn()
  driverTwoId:Driver['employeeId']|null;

  @Column()
  numberOfShipments:number; //Initially will be zero.

  //Truck Number
  @OneToOne(()=>Truck)
  @JoinColumn()
  truckNumber:Truck['truckNumber'];
}