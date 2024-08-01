import { User} from "./user";
import {IUser} from "./Iuser";

export interface UserRepository {
    findByEmail(email: string): Promise<User | null>;
    save(user: IUser): Promise<void>;
    addWebhook(userId: string, webhook: string): Promise<void>;
    getAll(): Promise<User[]>;
}