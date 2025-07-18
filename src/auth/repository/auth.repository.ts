import { Model } from 'mongoose';
import { SignUpDto } from '../dto/sign-up.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './../schemas/users.schema';
import { UserEntity } from '../entities/auth.entity';
import { RpcException } from '@nestjs/microservices';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { IAuthRepository } from 'src/commons/interfaces/respository.interface';
import { PaginationResponseInterface } from 'src/commons/interfaces/response.interface';

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

  /**
   * Update users
   * @param id
   * @param user
   * @returns
   */
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

  /**
   * Delete users
   * @param id
   */
  async delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /**
   * Count users by parent
   * @param parentId
   * @returns
   */
  async countUsersByParent(parentId: string): Promise<void | number> {
    try {
      return await this.model.countDocuments({ parent_id: parentId });
    } catch (error) {
      throw new RpcException({
        message: error.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  /**
   * Paginate users
   * @param query - Query object for filtering results
   * @param skip - Number of documents to skip
   * @param perPage - Number of documents per page
   * @param sortBy - Field to sort by (default: "name")
   * @param order - Sort order (1 for ascending, -1 for descending, default: "1")
   */
  public async paginate(
    query: Record<string, any>,
    skip: number,
    perPage: number,
    fields: string[] = ['_id', 'username', 'email', 'profile.full_name', 'type_user', 'scopes'],
  ): Promise<PaginationResponseInterface> {
    try {
      // Fetch paginated data
      const users = await this.model
        .find(query)
        .select(fields.length > 0 ? fields.join(' ') : '')
        .skip(skip)
        .limit(perPage);

      // Get total count of matching documents
      const totalUsers = await this.model.countDocuments(query);

      // Calculate total pages
      const totalPages = Math.ceil(totalUsers / perPage);

      return {
        data: users,
        totalPages,
        totalItems: totalUsers,
      };
    } catch (error: any) {
      throw new RpcException({
        message: error.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }
}
