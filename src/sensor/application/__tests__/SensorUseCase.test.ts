import { SensorUseCase } from '../SensorUseCase';
import { SensorRepository } from '../../domain/sensorRepository';
import { ISensor } from '../../domain/Isensor';
import { Sensor } from '../../domain/sensor';
import mongoose from 'mongoose';

// Mock del repositorio de sensores
const mockSensorRepository: jest.Mocked<SensorRepository> = {
  save: jest.fn(),
  getAll: jest.fn(),
  getByDate: jest.fn(),
};

describe('SensorUseCase', () => {
  let sensorUseCase: SensorUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    sensorUseCase = new SensorUseCase(mockSensorRepository);
  });

  it('B12: debe crear y guardar un nuevo registro de sensor correctamente', async () => {
    const newSensorData = new ISensor(500, 28, 60);
    mockSensorRepository.save.mockResolvedValue();
    await sensorUseCase.saveSensorData(newSensorData);
    expect(mockSensorRepository.save).toHaveBeenCalledWith(newSensorData);
  });

  it('B13: debe obtener todos los registros de los sensores y devolver un arreglo', async () => {
    const mockList: Sensor[] = [new Sensor(new mongoose.Types.ObjectId(), 510, 29, 62, new Date())];
    mockSensorRepository.getAll.mockResolvedValue(mockList);
    const result = await sensorUseCase.getSensorData();
    expect(result).toEqual(mockList);
  });
  
  it('B14: debe devolver un registro de sensor específico al buscarlo por fecha', async () => {
    const date = new Date();
    const mockList: Sensor[] = [new Sensor(new mongoose.Types.ObjectId(), 510, 29, 62, date)];
    mockSensorRepository.getByDate.mockResolvedValue(mockList);
    const result = await sensorUseCase.getSensorDataByDate(date);
    expect(result).toEqual(mockList);
  });

  it('B15: debe devolver un arreglo vacío si no se encuentra un sensor con la fecha especificada', async () => {
    const date = new Date('2099-12-31');
    mockSensorRepository.getByDate.mockResolvedValue([]);
    const result = await sensorUseCase.getSensorDataByDate(date);
    expect(result).toEqual([]);
  });
});