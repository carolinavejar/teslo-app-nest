import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Strategy, ExtractJwt} from "passport-jwt";
import { User } from "src/auth/entities/user.entity";
import { Repository } from "typeorm";
import { JWTPayload } from "./interfaces/jwt-payload.interface";


@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {
    constructor (
        @InjectRepository(User)
        private readonly userRepository : Repository< User > ,
        configService : ConfigService
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        })
    }

    async validate( payload: JWTPayload ): Promise <User> {
       
        const { id } = payload;

        const user = await this.userRepository.findOneBy({ id });

        if(!user) 
            throw new UnauthorizedException('TOKEN NOT VALID')
        

        if(!user.isActive)
        throw new UnauthorizedException('USER IS NOT ACTIVE')    
        return user;
    }
}