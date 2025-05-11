import { MQTTX } from "./MQTTX";
import {mongoSensorRepository} from "./dependencies";
import {webHookService} from "./dependencies";

export class DeviceSensorConsumer {
    private mqttx: MQTTX;

    constructor() {
        this.mqttx = new MQTTX();
        this.mqttx.connect();
        this.mqttx.createQueue('salida/01');
    }

    async start(io: any) {
        console.log('Starting consumer');
        this.mqttx.consumeMessage('salida/01', (message) => {
            try {
                let messageContent
                if ("payload" in message) {
                   messageContent  = JSON.parse(message.payload.toString());
                }
                console.log('Message received:', messageContent);
                if (!(messageContent.temperature > 25 && messageContent.temperature < 38)) {
                    console.log('Temperature is not within range');
                    webHookService.sendWebhookNotification(messageContent.temperature);
                }
                mongoSensorRepository.save({lumen: messageContent.luminosity, temperature: messageContent.temperature, humidity: messageContent.humidity});
                this.webSocketService(messageContent, io);
            } catch (error) {
                console.error('Invalid JSON message received:', message);
            }
        });
    }

     async webSocketService(sensors: {lumen: number,  temperature: number, humidity: number},  io:  any) {
        console.log('Emitting sensor data');
        io.emit('sensors:readAll', sensors)
    }
}



