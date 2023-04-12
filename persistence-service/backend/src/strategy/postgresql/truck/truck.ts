import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";

@Entity()
export class Truck {
  @PrimaryGeneratedColumn()
  truckNumber:number;             

  @Column()
  truckBrand:string;

  @Column()
  truckLoad:number;

  @Column()
  truckCapacity:number;

  @Column() 
  truckYear:number;

  //Will be added automatically if the repair data for this truck is added.
  @Column()
  numberOfRepairs:number;
}