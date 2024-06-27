import jwt from "jsonwebtoken";
import 'dotenv/config';

export const getToken = async (token: string) => {
    try {
        const {result}: any = jwt.verify(token, process.env.SECRET!);
        console.log(result);
        return result;
    } catch (error) {
        return error;
    }
}

export const verifyToken = async (req: any, res: any, next: any) => {
    try {

        const token = req.cookies['token'];
        if(!token) return res.status(401).json({message: 'No autorizado'});

        console.log(token)

        const result = await getToken(token);
        if(result === 'jwt expired') return res.status(401).json({message: 'Token expirado'});
        if(result === 'invalid token') return res.status(401).json({message: 'Token inválido'});
        next();
    }  catch (error: any) {
        res.status(500).json({error: error.message});
    }
}

export const verifyTokenWs = async (token: string) => {
    try {
        return await getToken(token);
    } catch (error) {
        return error;
    }
}