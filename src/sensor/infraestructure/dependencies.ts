import {MongoSensorRepository} from "./mongoSensorRepository";
import {SensorUseCase} from "../application/SensorUseCase";
import {SensorController} from "./controller/sensorController";
import {WebhookService} from "./helpers/WebhookService";

const mongoSensorRepository = new MongoSensorRepository();
const sensorUseCase = new SensorUseCase(mongoSensorRepository);
const sensorController = new SensorController(sensorUseCase);
const webHookService = new WebhookService();

export {sensorController, sensorUseCase, mongoSensorRepository, webHookService};