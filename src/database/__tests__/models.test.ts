import SensorModel from '../sensor.model';
import UsuarioModel from '../usuario.model';

describe('Mongoose Models Validation', () => {
  it('B20: UsuarioModel debe fallar la validación si no se proporciona el campo email', async () => {
    const userData = { nombre: 'Test User', password: '123' };
    const user = new UsuarioModel(userData);
    await expect(user.validate()).rejects.toThrow();
  });

  it('B21: SensorModel debe fallar la validación si no se proporciona el campo temperature', async () => {
    const sensorData = { lumen: 500, humidity: 60, fecha: new Date() };
    const sensor = new SensorModel(sensorData);
    await expect(sensor.validate()).rejects.toThrow();
  });
});