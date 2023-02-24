import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JWTPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create( {
        ...userData,
        password: bcrypt.hashSync(password, 10)
      } );

      await this.userRepository.save(user);
      delete user.password;

      return {
        ...user,
        token: this.getJWT({ id: user.id })
      };

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async loginUser (loginUserDto) {
    const { password, email } = loginUserDto;
    const user = await this.userRepository.findOne({ 
      where: { email },
      select: { email: true, password: true, id: true }
    });

    if( !user )
      throw new UnauthorizedException('Credentials are not valid(email)');

    if( !bcrypt.compareSync( password, user.password) )
      throw new UnauthorizedException('Credentials are not valid(password)');
    return {
      ...user,
      token: this.getJWT({ id: user.id })
    };
  }

  private getJWT ( payload: JWTPayload) {
    return this.jwtService.sign( payload )
  }

  private handleDBErrors (error : any) : never {
    console.log(error);
    
    if(error.code === '23505') {
      throw new BadRequestException(error.datail)
    }

    throw new InternalServerErrorException('Please check server logs')
  }

  async chkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJWT({ id: user.id})
    }
  }

}
