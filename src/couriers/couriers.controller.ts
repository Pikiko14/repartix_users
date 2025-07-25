import { CouriersService } from './couriers.service';
import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateCourierDto } from './dto/create-courier.dto';
import { QueryParamDto } from 'src/commons/dto/query-param.dto';
import { Usability } from 'src/commons/decorators/usability.decotator';
import { UsabilitiesGuard } from 'src/commons/guards/usabilities.guard';
import { DeleteUsersDto } from 'src/users/dto/delete-user.dto';

@Controller('couriers')
export class CouriersController {
  constructor(private readonly couriersService: CouriersService) {}

  @MessagePattern('create-couriers')
  @Usability('create_couriers')
  @UseGuards(UsabilitiesGuard)
  async createCouriers(createCourierDto: CreateCourierDto) {
    return this.couriersService.create(createCourierDto);
  }

  @MessagePattern('list-couriers')
  async listCouriers(queryParams: QueryParamDto) {
    return this.couriersService.get(queryParams);
  }

  @MessagePattern('delete-couriers')
  deleteCouriers(@Payload() deleteUsersDto: DeleteUsersDto) {
    return this.couriersService.deleteCouriers(deleteUsersDto);
    return deleteUsersDto;
  }
}
