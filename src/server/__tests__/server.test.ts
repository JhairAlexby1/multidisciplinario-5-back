import request from 'supertest';
import { app } from '../socket.io';
import mongoose from 'mongoose';

jest.mock('../../database/db.config', () => jest.fn());

describe('Server and Database Configuration', () => {
  it('D01: debe intentar establecer una conexión con la base de datos MongoDB', () => {
    const connectSpy = jest.spyOn(mongoose, 'connect').mockImplementation();
    require('../../database/db.config');
    expect(connectSpy).toHaveBeenCalled();
    connectSpy.mockRestore();
  });

  it('B22: debe tener las rutas de sensorRouter registradas en la aplicación de Express', async () => {
    const response = await request(app).get('/sensores/get');
    expect(response.status).not.toBe(404);
  });
});