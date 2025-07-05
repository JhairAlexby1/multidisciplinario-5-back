import { DeviceSensorConsumer } from '../deviceSensorConsumer';
import { mongoSensorRepository, webHookService } from '../dependencies';
import { MQTTX } from '../MQTTX';

jest.mock('../MQTTX');
jest.mock('../dependencies', () => ({
  mongoSensorRepository: { save: jest.fn() },
  webHookService: { sendWebhookNotification: jest.fn() },
}));

describe('DeviceSensorConsumer', () => {
  let consumer: DeviceSensorConsumer;
  let mockIo: { emit: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    consumer = new DeviceSensorConsumer();
    mockIo = { emit: jest.fn() };
  });

  it('B19 y B16: debe procesar un mensaje MQTT, llamar al repo y emitir por websocket', async () => {
    const mockMessage = { payload: Buffer.from(JSON.stringify({ luminosity: 550, temperature: 40, humidity: 65 })) };
    (MQTTX.prototype.consumeMessage as jest.Mock).mockImplementation((queue, callback) => {
      callback(mockMessage);
    });

    await consumer.start(mockIo);

    expect(mongoSensorRepository.save).toHaveBeenCalled(); // B19
    expect(mockIo.emit).toHaveBeenCalledWith('sensors:readAll', expect.any(Object)); // B16
  });
});