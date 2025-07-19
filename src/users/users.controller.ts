import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Controller, UseGuards } from '@nestjs/common';
import { QueryParamDto } from 'src/commons/dto/query-param.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UpdateUserBrandDto } from './dto/update-user-brand.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserBrandConfigurationDto } from './dto/update-map-brand.dto';
import { Usability } from 'src/commons/decorators/usability.decotator';
import { UsabilitiesGuard } from 'src/commons/guards/usabilities.guard';
import { UpdateUserCredentialDto } from './dto/update-user-credential.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('createUser')
  @Usability('create_user')
  @UseGuards(UsabilitiesGuard)
  create(@Payload() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @MessagePattern('updateUserCredential')
  updateCredentials(@Payload() updateCredentialsDto: UpdateUserCredentialDto) {
    return this.usersService.updateCredentials(updateCredentialsDto);
  }

  @MessagePattern('updateUserProfile')
  updateUserProfile(@Payload() updateUserProfileDto: UpdateUserProfileDto) {
    return this.usersService.updateUserProfile(updateUserProfileDto);
  }

  @MessagePattern('updateUserBrand')
  updateUserBrand(@Payload() updateUserBrandDto: UpdateUserBrandDto) {
    return this.usersService.updateUserBrand(updateUserBrandDto);
  }

  @MessagePattern('updateUserBrandConfiguration')
  updateUserBrandConfiguration(
    @Payload() updateUserBrandConfigurationDto: UserBrandConfigurationDto,
  ) {
    return this.usersService.updateUserBrandConfiguration(updateUserBrandConfigurationDto);
  }

  @MessagePattern('list-users')
  listUsers(
    @Payload() queryParams: QueryParamDto,
  ) {
    return this.usersService.get(queryParams);
  }

  @MessagePattern('update-users')
  updateUsers(
    @Payload() updateUsersDto: UpdateUserDto,
  ) {
    return this.usersService.update(updateUsersDto);
  }
}
