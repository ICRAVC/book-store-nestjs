import { type } from "os";
import { status } from "../../shared/entity-status.enum";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../user/user.entity";

@Entity('books')
export class Book extends BaseEntity{
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({type: 'varchar', length: 100, nullable: false})
  name: string;

  @Column({type: 'varchar', length: 100, nullable: false})
  description: string;

  @ManyToMany(type => User, user => user.books, {eager: true})
  @JoinColumn()
  authors: User[];

  @Column({type: 'varchar', default: status.ACTIVE, length: 8})
  status: string;

  @CreateDateColumn({type: 'timestamp', name: 'created_at'})
  createdAt: Date;

  @UpdateDateColumn({type: 'timestamp', name: 'updated_at'})
  updatedAt: Date;

}