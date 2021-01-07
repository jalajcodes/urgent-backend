import { Field, ObjectType } from '@nestjs/graphql';
import { IsDate, IsNumber } from 'class-validator';
import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class CoreEntity {
  @PrimaryGeneratedColumn()
  @Field(type => Number)
  @IsNumber()
  id: number;

  @Field(type => Date)
  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @Field(type => Date)
  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;
}
