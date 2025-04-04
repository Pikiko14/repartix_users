import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Strategy } from 'passport-jwt';
import { envs } from 'src/configuration';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayloadInterface } from 'src/commons/interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
  ) {
    super({
      secretOrKey: envs.jwt_secret,
      jwtFromRequest: (req) => {
        const token = req?.headers?.authorization?.replace('Bearer ', '');
        return token;
      },
    });
  }

  async validate(payload: JwtPayloadInterface): Promise<JwtPayloadInterface> {
    const { id, parent } = payload;

    const user = {
      id,
      parent,
      scopes: [],
    };

    if (!user) throw new NotFoundException('User not found');

    return user;
  }
}
