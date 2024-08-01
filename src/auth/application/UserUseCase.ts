import {UserRepository} from "../domain/userRepository";
import {IEcryptService} from "./services/IEncryptService";
import {IJwtService} from "./services/IJWTService";
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
                    return this.jwtService.generateToken({email: user.email, name: user.name, _id: user._id});
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

    async addWebhook(token: string, webhook: string): Promise<void> {
        try {
            const payload : object | null = this.jwtService.verifyToken(token);
            if (!payload) throw new Error('Invalid token');
            // @ts-ignore
            const userId = payload._id;
            await this.userRepository.addWebhook(userId, webhook);
        } catch (error) {
            console.error('Error in AuthUseCase addWebhook', error);
            throw error;
        }
    }

    async getAll(): Promise<IUser[]> {
        try {
            return await this.userRepository.getAll();
        } catch (error) {
            console.error('Error in AuthUseCase getAll', error);
            throw error;
        }
    }
}