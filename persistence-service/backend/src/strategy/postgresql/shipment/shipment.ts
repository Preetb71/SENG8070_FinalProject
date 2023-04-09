import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";
import { TruckTrip } from "../truckTrip";
import { Customer } from "../customer";

@Entity()
export class Shipment {
  @PrimaryGeneratedColumn()
  shipmentId:number;  
  
  @Column()
  shipmentWeight:number;

  @Column()
  shipmentValue:number;

  @Column()
  origin:string;

  @Column()
  destination:string;

  @OneToOne(()=>TruckTrip)
  @JoinColumn()
  truckNumber:TruckTrip['truckNumber'];

  @OneToOne(()=>Customer)
  @JoinColumn()
  customerId:Customer['customerId'];
}