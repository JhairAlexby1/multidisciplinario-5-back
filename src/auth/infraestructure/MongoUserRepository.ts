import {User} from "../domain/user";
import {UserRepository} from "../domain/userRepository";
import UsuarioModel from "../../database/usuario.model";
import {IUser} from "../domain/Iuser";

export class MongoUserRepository implements UserRepository {
    async findByEmail(email: string): Promise<User | null> {
        const user = await UsuarioModel.findOne({
            email: email
        });
        if (user) {
            return new User(user._id, user.nombre, user.email, user.password);
        }
        return null;
    }

    async save(user: IUser): Promise<void> {
        const newUser = new UsuarioModel({
            nombre: user.name,
            email: user.email,
            password: user.password
        });
        await newUser.save();
    }

    async addWebhook(userId: string, webhook: string): Promise<void> {
        const user = await UsuarioModel.findById(userId);
        if (user) {
            if (!user.webHook) {
                user.webHook = webhook;
            }
            await user.save();
        }
    }

    async getAll(): Promise<User[]> {
        const users = await UsuarioModel.find();
        return users.map(user => new User(user._id, user.nombre, user.email, user.password));
    }

}
