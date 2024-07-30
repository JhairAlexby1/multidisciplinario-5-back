import {ISensor} from "../domain/Isensor";
import {SensorRepository} from "../domain/sensorRepository";
import { MQTTX } from "../infraestructure/MQTTX";

export class SensorUseCase {
    private mqttX: MQTTX;
    constructor(
        private sensorRepository: SensorRepository
    ) {
        this.mqttX = new MQTTX();
        this.mqttX.connect();
    }

    async getSensorData() {
        return Object.values(this.sensorRepository.getAll());
    }

    async getSensorDataByDate(date: Date) {
        return Object.values(this.sensorRepository.getByDate(date));
    }

    async saveSensorData(sensor: ISensor) {
        await this.sensorRepository.save(sensor);
    }
}