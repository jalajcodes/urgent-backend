import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class UpdateProfileOutput extends CoreOutput {}

@InputType()
export class UpdateProfileInput extends PartialType(
  PickType(User, ['email', 'password', 'role']),
) {}
