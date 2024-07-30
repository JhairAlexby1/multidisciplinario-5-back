
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
                console.log('Message received:', message.toString());
                const messageContent = JSON.parse(message.toString());
                console.log('Message received:', messageContent);
            }
        });
    }
}

const deviceSensorConsumer = new DeviceSensorConsumer();
deviceSensorConsumer.start();

