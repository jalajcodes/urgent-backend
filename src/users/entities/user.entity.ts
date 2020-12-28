import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BeforeInsert, Column, Entity } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { IsEmail, IsEnum, IsString } from 'class-validator';

enum UserRoles {
  Client,
  Owner,
  Delivery,
}

registerEnumType(UserRoles, { name: 'UserRoles' });

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column()
  @Field(type => String)
  @IsEmail()
  email: string;
  @Column()
  @Field(type => String)
  @IsString()
  password: string;
  @Column()
  @Field(type => UserRoles)
  @IsEnum(UserRoles)
  role: UserRoles;

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async checkPassword(password): Promise<boolean> {
    try {
      return bcrypt.compare(password, this.password);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
