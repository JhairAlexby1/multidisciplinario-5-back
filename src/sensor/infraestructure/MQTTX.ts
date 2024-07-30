import mqtt from "mqtt";

export class MQTTX {
    private client: mqtt.MqttClient;

    constructor() {
        this.client = mqtt.connect(process.env.MQTTX_URL!);
    }

    connect() {
        this.client.on('connect', () => {
            console.log('Connected to MQTT Broker');
        });
    }

    createQueue(queue: string) {
        this.client.subscribe(queue, (err: any) => {
            if (err) {
                console.error(err);
            }
        });
    }

    consumeMessage(queue: string, callback: (message: mqtt.Packet) => void) {
        this.client.on('message', (topic: string, message: any, packet: mqtt.Packet) => {
            if (topic === queue) {
                callback(packet);
            }
        });
    }
}