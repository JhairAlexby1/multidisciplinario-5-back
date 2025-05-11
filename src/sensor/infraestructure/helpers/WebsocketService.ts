import {IWebsocketService} from "../../application/services/IWebsocketService";
import {sensorUseCase} from '../dependencies'
import {SensorUseCase} from "../../application/SensorUseCase";



export default (io: any, socket: any) => {
    class WebsocketService implements IWebsocketService {
        constructor(
            private sensorUseCase: SensorUseCase
        ) {}
        getWebsocketData = async (): Promise<void> => {
            const sensors = await this.sensorUseCase.getSensorData()
            io.emit('sensors:readAll', sensors);
        };

        async getWebsocketDataByDate(date: Date): Promise<void> {
            const sensors = await this.sensorUseCase.getSensorDataByDate(date);
            io.emit('sensors:readByDate', sensors);
        }
    }


    const websocketService = new WebsocketService(sensorUseCase);

    socket.on('sensors:getAll', async () => {
        await websocketService.getWebsocketData();
    });
    socket.on('sensors:getByDate', websocketService.getWebsocketDataByDate);

}
