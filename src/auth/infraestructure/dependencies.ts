import { UserUseCase } from "../application/UserUseCase";
import { UserController } from "./controllers/UserController";
import { EncryptService } from "./helpers/EncryptService";
import { JwtService } from "./helpers/JWTService";
import {MongoUserRepository} from "./MongoUserRepository";

const encryptPassword = new EncryptService();
const jwtService = new JwtService();
const mongoUserRepository = new MongoUserRepository();

const userUseCase = new UserUseCase(mongoUserRepository, encryptPassword, jwtService );
const userController = new UserController(userUseCase);

export { userController, userUseCase, MongoUserRepository, encryptPassword, jwtService };