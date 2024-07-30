import { Request, Response } from "express";
import { UserUseCase } from "../../application/UserUseCase";

export class UserController {
    constructor(readonly userUseCase: UserUseCase) { }

    async login(req: Request, res: Response) {
        try {
            let { email, password } = req.body;

            let token = await this.userUseCase.login(email, password);

            if (token) {
                res.header("Set-Cookie", token);
                res.status(200).send();
                return res.status(200).send({
                    status: "success",
                    message: "User Logeado"
                })
            } else {
                return res.status(400).send({
                    status: "Error",
                    data: [],
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
            let { name, email, password } = req.body;

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
}