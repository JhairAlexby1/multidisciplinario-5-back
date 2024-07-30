import express from "express";

import { userController } from "./dependencies";

export const userRouter = express.Router();

userRouter.post(
    "/login", userController.login.bind(userController)
);

userRouter.post(
    "/register", userController.register.bind(userController)
);

userRouter.post(
    "/webhook", userController.addWebhook.bind(userController)
);