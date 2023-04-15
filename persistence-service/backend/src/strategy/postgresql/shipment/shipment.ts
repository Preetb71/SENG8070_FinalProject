import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";
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

  @ManyToOne(()=>TruckTrip, {onDelete:'CASCADE'})
  @JoinColumn()
  truckTrip:TruckTrip;

  @ManyToOne(()=>Customer, {onDelete:'CASCADE'})
  @JoinColumn()
  customer:Customer;
}