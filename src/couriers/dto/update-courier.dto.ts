import { PartialType } from '@nestjs/mapped-types';
import { CreateCourierDto } from './create-courier.dto';
import { Optional } from '@nestjs/common';
import { IsString } from 'class-validator';

export class UpdateCourierDto extends PartialType(CreateCourierDto) {
    @IsString()
    @Optional()
    id: string;
}
