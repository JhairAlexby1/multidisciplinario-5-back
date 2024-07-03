import { UserRepository } from "../domain/userRepository";
import { IEcryptService } from "./services/IEncryptService";
import { IJwtService } from "./services/IJWTService";
import {IUser} from "../domain/Iuser";

export class UserUseCase {
    constructor(
        readonly userRepository: UserRepository,
        readonly encryptPassword: IEcryptService,
        readonly jwtService: IJwtService,
    ) {}

    async login(email: string, password: string): Promise<string | null> {
        try {
            const user = await this.userRepository.findByEmail(email);
            if (user) {
                const isPasswordCorrect = this.encryptPassword.authPassword(password, user.password);
                if (isPasswordCorrect) {
                    const token = this.jwtService.generateToken({ email: user.email, name: user.name });


                    console.log(token)
                    return token;
                }
            }
            return null;
        } catch (error) {
            console.error('Error in AuthUseCase login', error);
            return null;
        }
    }

    async register(name: string, email: string, password: string): Promise<void> {
        try {
            const encode = await this.encryptPassword.encodePassword(password);
            const user = new IUser(name, email, encode);
            await this.userRepository.save(user);
        } catch (error) {
            console.error('Error in AuthUseCase register', error);
            throw error;
        }
    }
}