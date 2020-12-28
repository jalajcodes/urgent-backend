import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant-dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant-dto';
import { Restaurant } from './entities/restaurant.entitiy';
import { RestaurantService } from './restaurants.service';

@Resolver(of => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Query(returns => [Restaurant])
  getRestaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  @Mutation(returns => Boolean)
  async createRestaurant(
    @Args('input') createRestaurantArgs: CreateRestaurantDto,
  ): Promise<boolean> {
    await this.restaurantService.createRestaurant(createRestaurantArgs);
    return true;
  }

  @Mutation(returns => Boolean)
  async updateRestaurant(
    @Args('input') updateRestaurantArgs: UpdateRestaurantDto,
  ): Promise<boolean> {
    await this.restaurantService.updateRestaurant(updateRestaurantArgs);
    return true;
  }
}
