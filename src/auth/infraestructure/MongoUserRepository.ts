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

}
