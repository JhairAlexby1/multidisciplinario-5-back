import jwt from 'jsonwebtoken';
import { IJwtService } from '../../application/services/IJWTService';

export class JwtService implements IJwtService {

    generateToken(payload: object): string {
        return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
    }

    verifyToken(token: string): object | null {
        try {
            return jwt.verify(token, process.env.JWT_SECRET!) as object;
        } catch (error) {
            console.error('Invalid token', error);
            return null;
        }
    }
}