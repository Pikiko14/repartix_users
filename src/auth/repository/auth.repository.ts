import { Model } from 'mongoose';
import { SignUpDto } from '../dto/sign-up.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './../schemas/users.schema';
import { UserEntity } from '../entities/auth.entity';
import { RpcException } from '@nestjs/microservices';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { IAuthRepository } from 'src/commons/interfaces/respository.interface';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(@InjectModel(User.name) private readonly model: Model<User>) {}

  /**
   * Create one user in bbdd
   * @param { signUpDto: SignUpDto }
   * @returns { Promise<UserEntity | unknown> }
   */
  async create(signUpDto: SignUpDto): Promise<UserEntity> {
    try {
      return (await this.model.create(signUpDto)) as any;
    } catch (error) {
      throw new RpcException({
        message: error.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  /**
   * Find User by key and value
   * @param params
   */
  async find(params: {
    key: keyof UserEntity;
    value: any;
  }): Promise<UserEntity | null> {
    try {
      return await this.model.findOne({ [params.key]: params.value });
    } catch (error) {
      throw new RpcException({
        message: error.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  async update(id: string, user: UserEntity): Promise<UserEntity | null> {
    try {
      return await this.model.findByIdAndUpdate(id, user, { new: true });
    } catch (error) {
      throw new RpcException({
        message: error.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
