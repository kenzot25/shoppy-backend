import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { Response } from 'express';
import ms from 'ms';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './token-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.userService.getUser({
        email,
      });
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) return user;
      else throw new UnauthorizedException();
    } catch (err) {
      throw new UnauthorizedException('Credentials is not valid.');
    }
  }

  async login(user: User, res: Response) {
    const expires = new Date();
    expires.setMilliseconds(
      expires.getMilliseconds() +
        ms(this.configService.getOrThrow<string>('JWT_EXPIRATION')),
    );
    const tokenPayload: TokenPayload = {
      userId: user.id,
    };
    const token = this.jwtService.sign(tokenPayload);
    res.cookie('Authentication', token, {
      // secure: true,
      secure: false, // temporary set to false due to thunder client behavior
      httpOnly: true,
      expires: expires,
    });
    return { tokenPayload };
  }
}
