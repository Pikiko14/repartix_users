import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
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
}
