import {MongoSensorRepository} from "./mongoSensorRepository";
import {SensorUseCase} from "../application/SensorUseCase";
import {SensorController} from "./controller/sensorController";

const mongoSensorRepository = new MongoSensorRepository();
const sensorUseCase = new SensorUseCase(mongoSensorRepository);
const sensorController = new SensorController(sensorUseCase);

export {sensorController, sensorUseCase, mongoSensorRepository};