import SensorModel from "../../database/sensor.model";
import {Sensor} from "../domain/sensor";
import {SensorRepository} from "../domain/sensorRepository";
import {ISensor} from "../domain/Isensor";

export class MongoSensorRepository implements SensorRepository {
    async save(sensor: ISensor): Promise<void> {
        const newSensor = new SensorModel({
            lumen: sensor.lumen,
            temperature: sensor.temperature,
            humidity: sensor.humidity,
            fecha: sensor.fecha
        });
        await newSensor.save();
    }

    async getAll(): Promise<Sensor[]> {
        const sensors = await SensorModel.find();
        return sensors.map((sensor) => {
            return new Sensor(sensor._id, sensor.lumen, sensor.temperature, sensor.humidity, sensor.fecha);
        });
    }

    async getByDate(date: Date): Promise<Sensor[]> {
        const sensors = await SensorModel.find({
            fecha: date
        });
        return sensors.map((sensor) => {
            return new Sensor(sensor._id, sensor.lumen, sensor.temperature, sensor.humidity, sensor.fecha);
        });
    }

}