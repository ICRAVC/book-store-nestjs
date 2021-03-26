import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthRepository } from './auth.repository';
import {JwtService} from '@nestjs/jwt';
import { LoggedInDto, SigninDto, SignupDto } from './dto';
import { User } from '../user/user.entity';
import {compare} from 'bcryptjs';
import { IJwtPayload } from './jwt-payload.interface';
import { RoleType } from '../role/roletype.enum';
import { plainToClass } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthRepository)
    private readonly _authRepository: AuthRepository,
    private readonly _jwtService: JwtService,
    ){

  }
  async signup(signupDto: SignupDto): Promise<void>{
    const {username, email} = signupDto;
    const userExists = await this._authRepository.findOne({
      where: [{username}, {email}]
    });

    if(userExists){
      throw new ConflictException('El usuario o email existen');
    }

    return this._authRepository.signup(signupDto);
  }

  async signin(signinDto: SigninDto): Promise<LoggedInDto>{
    const {username, password} = signinDto;
    const user: User = await this._authRepository.findOne({
      where: {username},
    });

    if(!user){
      throw new NotFoundException("Usuario no existe");
    }
    const isMatch = await compare(password, user.password);
    if(!isMatch){
      throw new UnauthorizedException('Usuario o paswword no válidos');
    }
    const payload: IJwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles.map(r => r.name as RoleType)

    }

    const token = this._jwtService.sign(payload);
    return plainToClass(LoggedInDto, {token, user});
  }
}
