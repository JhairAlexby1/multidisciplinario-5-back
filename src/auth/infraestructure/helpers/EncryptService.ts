import bcrypt from "bcrypt";

import {IEcryptService} from "../../application/services/IEncryptService";

export class EncryptService implements IEcryptService {
    encodePassword(password: string): string {
        return bcrypt.hashSync(password, parseInt(process.env.SALT_ROUNDS as string) || 10);
    }
    authPassword(word: string, passwordEncode: string): boolean {
        return bcrypt.compareSync(word, passwordEncode);
    }
}