import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateRestaurantDto } from './create-restaurant-dto';

@InputType()
export class UpdateRestaurantInputType extends PartialType(CreateRestaurantDto) {}

@InputType()
export class UpdateRestaurantDto {
  @Field(returns => Number)
  id: number;

  @Field(returns => UpdateRestaurantInputType)
  data: UpdateRestaurantInputType;
}
