import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  employeeId:number;             

  @Column({
    length: 100,
  })
  firstName:string;

  @Column({
    length: 100,
  })
  lastName:string;

  @Column({
    length: 100,
  })
  seniority:string;

}