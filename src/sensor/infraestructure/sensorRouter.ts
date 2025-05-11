import express from "express";
import { sensorController } from "./dependencies"

export const sensorRouter = express.Router();

sensorRouter.get('/get', sensorController.getSensorData.bind(sensorController));
sensorRouter.get('/get/:date', sensorController.getSensorDataByDate.bind(sensorController));
sensorRouter.post('/save', sensorController.saveSensorData.bind(sensorController));