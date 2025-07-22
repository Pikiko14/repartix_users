import { CouriersService } from './couriers.service';
import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CreateCourierDto } from './dto/create-courier.dto';
import { Usability } from 'src/commons/decorators/usability.decotator';
import { UsabilitiesGuard } from 'src/commons/guards/usabilities.guard';

@Controller('couriers')
export class CouriersController {
  constructor(private readonly couriersService: CouriersService) {}
  
  @MessagePattern('create-couriers')
  @Usability('create_couriers')
  @UseGuards(UsabilitiesGuard)
  async createCouriers(createCourierDto: CreateCourierDto) {
    return this.couriersService.create(createCourierDto);
  }
}
