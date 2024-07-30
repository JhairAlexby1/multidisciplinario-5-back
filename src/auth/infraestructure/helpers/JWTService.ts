import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import {IJwtService} from '../../application/services/IJWTService';

export class JwtService implements IJwtService {

    generateToken(payload: object): string {
        const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
        return cookie.serialize('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60,
        });
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