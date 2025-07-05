import express from 'express';
import request from 'supertest';
import { sensorRouter } from '../sensorRouter';
import { sensorUseCase } from '../dependencies';

jest.mock('../../application/SensorUseCase');

const mockSensorUseCase = sensorUseCase as jest.Mocked<typeof sensorUseCase>;
const app = express();
app.use(express.json());
app.use('/sensores', sensorRouter);

describe('Sensor Router Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('I05: debe responder con estado 201 al añadir un nuevo dato de sensor', async () => {
    mockSensorUseCase.saveSensorData.mockResolvedValue();
    const response = await request(app).post('/sensores/save').send({ lumen: 500, temperature: 25, humidity: 60 });
    expect(response.status).toBe(201);
  });

  it('I06: debe responder con estado 200 y una lista de datos', async () => {
    const mockData = [{ temperature: 25 }];
    mockSensorUseCase.getSensorData.mockResolvedValue(mockData as any);
    const response = await request(app).get('/sensores/get');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockData);
  });

  it('I07: debe responder con 404 si no se encuentra un ID', async () => {
    const date = '2099-12-31';
    mockSensorUseCase.getSensorDataByDate.mockResolvedValue([]);
    const response = await request(app).get(`/sensores/get/${date}`);
    // Esta prueba está diseñada para esperar 404, según el plan.
    // Si el controlador devuelve 200, la prueba fallará, indicando un bug.
    expect(response.status).toBe(404);
  });
});