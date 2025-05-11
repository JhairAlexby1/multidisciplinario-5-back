import { Request, Response } from "express";
import { UserUseCase } from "../../application/UserUseCase";

export class UserController {
    constructor(readonly userUseCase: UserUseCase) { }

    async login(req: Request, res: Response) {
        try {
            let { email, password } = req.body;
            console.log("email", email);

            let token = await this.userUseCase.login(email, password);
            console.log("token", token);
            if (token) {
                res.setHeader('Set-Cookie', token)
                res.setHeader('Authorization', token)
                res.status(200).send({
                    status: "success",
                    data: token,
                    message: "User Logeado"
                })
            } else {
                return res.status(400).send({
                    status: "Error",
                    Message: "Error Al Logear User"
                });
            }
        } catch (error) {
            console.error("Error In Controller", error);
            res.status(404).send({
                status: "error",
                Message: "Error In Server"
            });
        }
    }

    async register(req: Request, res: Response) {
        try {
            console.log("req.body", req.body);
            let { name, email, password } = req.body;
            console.log("name", name);

            await this.userUseCase.register(name, email, password);

            return res.status(200).send({
                status: "success",
                data: [],
                message: "User Registrado"
            })
        } catch (error) {
            console.error("Error In Controller", error);
            res.status(404).send({
                status: "error",
                Message: "Error In Server"
            });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const users = await this.userUseCase.getAll();
            return res.status(200).send({
                status: "success",
                data: users,
                message: "Users Encontrados"
            })
        } catch (error) {
            console.error("Error In Controller", error);
            res.status(404).send({
                status: "error",
                Message: "Error In Server"
            });
        }
    }

    async addWebhook(req: Request, res: Response) {
        try {
            const token = req.cookies['token'];
            if (!token) return res.status(401).json({ message: 'Usuario no logeado' });

            const { webhook } = req.body;

            await this.userUseCase.addWebhook(token, webhook);

            return res.status(200).send({
                status: "success",
                message: "Webhook Agregado"
            })
        } catch (error) {
            console.error("Error In Controller", error);
            res.status(404).send({
                status: "error",
                Message: "Error In Server"
            });
        }
    }

    async logout(req: Request, res: Response) {
        try {
            res.clearCookie('token');
            res.status(200).send({
                status: "success",
                message: "User Deslogeado"
            })
        } catch (error) {
            console.error("Error In Controller", error);
            res.status(404).send({
                status: "error",
                Message: "Error In Server"
            });
        }
    }


}