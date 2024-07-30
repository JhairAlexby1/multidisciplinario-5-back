import  { Request, Response } from 'express';
import { SensorUseCase } from '../../application/SensorUseCase';

export class SensorController {
    constructor(
        private sensorUseCase: SensorUseCase
    ) {}

    async getSensorData(req: Request, res: Response) {
        try {
            const sensorData = await this.sensorUseCase.getSensorData();
            res.status(200).send(sensorData);
        } catch (error) {
            res.status(500).send(error);
        }
    }

    async getSensorDataByDate(req: Request, res: Response) {
        try {
            const date = new Date(req.params.date);
            const sensorData = await this.sensorUseCase.getSensorDataByDate(date);
            res.status(200).send(sensorData);
        } catch (error) {
            res.status(500).send(error);
        }
    }

    async saveSensorData(req: Request, res: Response) {
        try {
            const sensor = req.body;
            await this.sensorUseCase.saveSensorData(sensor);
            res.status(201).send('Sensor data saved');
        } catch (error) {
            res.status(500).send(error);
        }
    }
}