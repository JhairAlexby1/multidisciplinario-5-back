import express from "express";
import UsuarioController from "../controllers/usuario.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", UsuarioController.index);
router.post("/", UsuarioController.create);
router.post("/login", UsuarioController.login);
router.post("/logout", verifyToken, UsuarioController.logout);

export default router