import UsuarioOrm from "../domain/orm/usuario.orm";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const index = async (req: Request, res: Response) => {
    try {
        const usuarios = await UsuarioOrm.obtenerUsuarios();
        return res.status(200).json(usuarios);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const create = async (req: Request, res: Response) => {
    try {
        await UsuarioOrm.crearUsuario(req.body);
        return res.status(201).json({ message: "Usuario creado correctamente" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const login = async (req: Request, res: Response) => {
    try {
        const token = await UsuarioOrm.login(req.body.email, req.body.password);
        if (!token)
            return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
        res.header("Set-Cookie", token);
        res.status(200).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const logout = async (req: Request, res: Response) => {
    try {
        const token = req.cookies['token'];
        if (!token) return res.status(401).json({ message: 'Usuario no logeado' });
        const payload: any = jwt.verify(token, process.env.JWT_SECRET as string);

        res.clearCookie('token');
        return res.status(200).json({ message: 'Usuario deslogeado correctamente' });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export default {index, login, create, logout}