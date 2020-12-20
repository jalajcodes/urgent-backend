import { Args, ArgsType, Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsString, Length } from 'class-validator';

@ArgsType()
export class CreateRestaurantDto {
  @Field(type => String)
  @IsString()
  @Length(5, 10)
  name: string;

  @IsBoolean()
  @Field(type => Boolean)
  isVegan: boolean;

  @IsNumber()
  @Field(type => Number)
  streetNum: number;
}
