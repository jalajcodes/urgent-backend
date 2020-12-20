import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant-dto';
import { Restaurant } from './entities/restaurant.entitiy';
import { RestaurantService } from './restaurants.service';

@Resolver(of => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Query(returns => [Restaurant])
  getRestaurants(@Args('vegan') vegan?: boolean): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  @Mutation(returns => String)
  createRestaurant(@Args() createRestaurantArgs: CreateRestaurantDto) {
    return 100;
  }
}
