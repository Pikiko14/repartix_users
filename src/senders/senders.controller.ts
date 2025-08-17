import { Controller } from '@nestjs/common';
import { SendersService } from './senders.service';
import { CreateSenderDto } from './dto/create-sender.dto';
import { UpdateSenderDto } from './dto/update-sender.dto';
import { DeleteUsersDto } from 'src/users/dto/delete-user.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QueryParamDto } from 'src/commons/dto/query-param.dto';

@Controller()
export class SendersController {
  constructor(private readonly sendersService: SendersService) {}

  @MessagePattern('create-sender')
  create(@Payload() createSenderDto: CreateSenderDto) {
    return this.sendersService.create(createSenderDto);
  }

  @MessagePattern('find-all-sender')
  findAll(
    @Payload() queryParams: QueryParamDto,
  ) {
    return this.sendersService.findAll(queryParams);
  }

  @MessagePattern('update-sender')
  update(@Payload() updateSenderDto: UpdateSenderDto) {
    return this.sendersService.update(updateSenderDto);
  }

  @MessagePattern('remove-sender')
  remove(@Payload() deleteUsersDto: DeleteUsersDto) {
    return this.sendersService.remove(deleteUsersDto);
  }
}
