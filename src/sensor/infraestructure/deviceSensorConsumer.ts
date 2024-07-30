import mqtt from 'mqtt';
import { MQTTX} from "./MQTTX";

export class DeviceSensorConsumer {
    private mqttx: MQTTX;

    constructor() {
        this.mqttx = new MQTTX();
        this.mqttx.connect();
        this.mqttx.createQueue('salida/01');
    }

    start() {
        this.mqttx.consumeMessage('salida/01', (message) => {
            if (message !== null) {
                const messageContent = JSON.parse(message.content.toString());
                console.log('Message received:', messageContent);
                this.mqttx.ackMessage(message);
            }
        });
    }
}

const deviceSensorConsumer = new DeviceSensorConsumer();
deviceSensorConsumer.start();

