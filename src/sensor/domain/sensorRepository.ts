import { ISensor } from "./Isensor";
import { Sensor } from "./sensor";
export interface SensorRepository{
    save(sensor: ISensor): Promise<void>;
    getAll(): Promise<Sensor[]>;
    getByDate(date: Date): Promise<Sensor[]>;

}