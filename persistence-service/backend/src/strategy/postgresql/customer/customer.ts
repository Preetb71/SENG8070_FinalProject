import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  customerId:number;  
  
  @Column()
  customerName:string;

  @Column()
  customerAddress:string;

  @Column()
  customerPhoneNumberOne:string;

  @Column()
  customerPhoneNumberTwo:string;
}