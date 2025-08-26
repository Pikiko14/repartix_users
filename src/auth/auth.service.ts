import {
  Injectable,
  BadRequestException,
  UnprocessableEntityException,
  NotFoundException,
  UnauthorizedException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { firstValueFrom } from 'rxjs';
import { envs } from 'src/configuration';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { Utils } from 'src/commons/utils/utils';
import { UserEntity } from './entities/auth.entity';
import { scopes } from 'src/commons/constants/scopes';
import { AuthRepository } from './repository/auth.repository';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RecoveryPasswordDto } from './dto/recovery-password.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { UpdateUserBrandDto } from 'src/users/dto/update-user-brand.dto';
import { UpdateUserProfileDto } from 'src/users/dto/update-user-profile.dto';
import { JwtPayloadInterface } from 'src/commons/interfaces/jwt-payload.interface';
import { UpdateUserCredentialDto } from 'src/users/dto/update-user-credential.dto';

@Injectable()
export class AuthService {
  constructor(
    private utils: Utils,
    private jwtService: JwtService,
    private readonly repository: AuthRepository,
    @Inject(envs.nats_service_name)
    private readonly client: ClientProxy,
  ) {}

  /**
   * Do Sign In
   * @param createAuthDto
   * @returns
   */
  async signIn(createAuthDto: SignInDto) {
    // validate isset user
    let user = await this.repository.find({
      key: 'username',
      value: createAuthDto.username,
    });

    if (!user) {
      user = await this.repository.find({
        key: 'email',
        value: createAuthDto.username,
      });
    }

    if (!user)
      throw new RpcException({
        message: `User with this username: ${createAuthDto.username} don't found.`,
        status: HttpStatus.NOT_FOUND,
      });

    // compare password
    if (!(await bcrypt.compare(createAuthDto.password, user.password)))
      throw new RpcException({
        message: 'Password incorrect',
        status: HttpStatus.UNAUTHORIZED,
      });

    try {
      const token = await this.getJwtToken({
        id: user._id,
        parent: user.parent_id || null,
        scopes: user.scopes,
      });
      const subscription = await firstValueFrom(
        this.client.send('get_user_subscription', user.parent_id || user._id),
      );

      if (user && user.parent_id) {
        const userMain = await this.repository.find({
          key: '_id',
          value: user.parent_id,
        });
        user.brand = userMain.brand;
      }

      return {
        success: true,
        user: {
          ...JSON.parse(JSON.stringify(user)),
          subscription,
        },
        token,
        message: 'Sign In successfully',
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  /**
   * Do Sign Up
   * @param signUpDto
   * @returns
   */
  async signUp(signUpDto: SignUpDto) {
    // validate if user exist with this email
    const issetUserWithEmail = await this.repository.find({
      key: 'email',
      value: signUpDto.email,
    });
    if (issetUserWithEmail)
      throw new RpcException({
        message: `Exist one user with this email: ${signUpDto.email}.`,
        status: HttpStatus.CONFLICT,
      });

    // validate if yser exist with this username
    const issetUserWithUsername = await this.repository.find({
      key: 'username',
      value: signUpDto.username,
    });
    if (issetUserWithUsername)
      throw new RpcException({
        message: `Exist one user with this username: ${signUpDto.username}.`,
        status: HttpStatus.CONFLICT,
      });

    // if all is ok
    try {
      const { password, ...userData } = signUpDto;
      const user = await this.repository.create({
        ...userData,
        password: await bcrypt.hash(password, 10),
        scopes: signUpDto?.scopes || scopes,
      });

      // send welcome notification
      this.client.emit('createNotitication', {
        data: {
          ...JSON.parse(JSON.stringify(user)),
          password_string: password,
        },
        channel: 'email',
        type_notification: 'welcome_notification',
        destinatary: user?.email,
      });

      // return response
      return {
        success: true,
        user,
        token: await this.getJwtToken({
          id: user._id,
          parent: user.parent_id || null,
          scopes: user.scopes,
        }),
        message: 'Sign Up successfully',
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  /**
   * Init recovery password
   * @param recoveryPasswordDto
   * @returns
   */
  async recoveryPassword(recoveryPasswordDto: RecoveryPasswordDto) {
    // validate exist user
    let user = await this.repository.find({
      key: 'email',
      value: recoveryPasswordDto.email,
    });
    if (!user)
      throw new RpcException({
        message: `User with this email: ${recoveryPasswordDto.email} don't found.`,
        status: HttpStatus.NOT_FOUND,
      });

    // init recovery process
    try {
      user.recovery_token = this.utils.generateUuId();
      user = await this.repository.update(user._id, user);

      // send welcome notification
      this.client.emit('createNotitication', {
        data: { ...JSON.parse(JSON.stringify(user)) },
        channel: 'email',
        type_notification: 'recovery_password_notification',
        destinatary: user?.email,
      });

      // return response
      return {
        success: true,
        user,
        message: 'Password recovery process started successfully',
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  /**
   * Change password
   * @param recoveryPasswordDto
   * @returns
   */
  async changePassword(changePasswordDto: ChangePasswordDto) {
    // validate exist user
    let user = await this.repository.find({
      key: 'email',
      value: changePasswordDto.email,
    });
    if (!user)
      throw new RpcException({
        message: `User with this email: ${changePasswordDto.email} don't found.`,
        status: HttpStatus.NOT_FOUND,
      });

    if (!user.recovery_token)
      throw new RpcException({
        message: `Recovery proccess don´t init`,
        status: HttpStatus.BAD_REQUEST,
      });

    if (changePasswordDto.token !== user.recovery_token)
      throw new RpcException({
        message: `The recovery token is incorrect.`,
        status: HttpStatus.FORBIDDEN,
      });

    // change password
    try {
      user.recovery_token = null; // clear token recovery.
      (user.password = await bcrypt.hash(changePasswordDto.password, 10)),
        (user = await this.repository.update(user._id, user));

      // return response
      return {
        success: true,
        user,
        message: 'Password changed successfully',
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  /**
   * Generate token JWT
   * @param payload
   * @returns
   */
  private async getJwtToken(payload: JwtPayloadInterface): Promise<string> {
    try {
      const token = await this.jwtService.signAsync(payload);
      return token;
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  /**
   * Count users by parent
   * @param parentId
   * @returns { number }
   */
  async countUsersByParent(parentId: string): Promise<number | void> {
    return await this.repository.countUsersByParent(parentId);
  }

  /**
   * Update user credential
   * @param { UpdateUserCredentialDto } updateDredentialsDto
   */
  async updateCredentials(updateUserCredentialDto: UpdateUserCredentialDto) {
    try {
      let user = await this.repository.find({
        key: '_id',
        value: updateUserCredentialDto.user_id,
      });

      // validate if user exist with this email
      const issetUserWithEmail = await this.repository.find({
        key: 'email',
        value: updateUserCredentialDto.email,
      });
      if (
        issetUserWithEmail &&
        issetUserWithEmail._id.toString() !== updateUserCredentialDto.user_id
      )
        throw new RpcException({
          message: `Exist one user with this email: ${updateUserCredentialDto.email}.`,
          status: HttpStatus.CONFLICT,
        });

      // validate if yser exist with this username
      const issetUserWithUsername = await this.repository.find({
        key: 'username',
        value: updateUserCredentialDto.username,
      });
      if (
        issetUserWithUsername &&
        issetUserWithUsername._id.toString() !== updateUserCredentialDto.user_id
      )
        throw new RpcException({
          message: `Exist one user with this username: ${updateUserCredentialDto.username}.`,
          status: HttpStatus.CONFLICT,
        });

      user.email = updateUserCredentialDto.email;
      user.username = updateUserCredentialDto.username;
      if (updateUserCredentialDto.password) {
        user.password = await bcrypt.hash(updateUserCredentialDto.password, 10);
      }
      user = await this.repository.update(user._id, user);
      return {
        success: true,
        user,
        message: 'Credentials Change Success',
      };
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
}
