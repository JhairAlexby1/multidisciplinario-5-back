import {ISensor} from "../domain/Isensor";
import {SensorRepository} from "../domain/sensorRepository";
import {MQTTX} from "../infraestructure/MQTTX";

export class SensorUseCase {
    constructor(
        private sensorRepository: SensorRepository
    ) {

    }

    async getSensorData() {
        return this.sensorRepository.getAll();
    }

    async getSensorDataByDate(date: Date) {
        return this.sensorRepository.getByDate(date);
    }

    async saveSensorData(sensor: ISensor) {
        await this.sensorRepository.save(sensor);
    }
}