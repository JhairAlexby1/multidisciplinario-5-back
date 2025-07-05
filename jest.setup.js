// Mock de variables de entorno
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.PORT = '3001';
process.env.MONGO_URI = 'mongodb://localhost:27017/test';

// Mock de mongoose para evitar conexiones reales
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({}),
  connection: {
    collections: {},
    dropDatabase: jest.fn().mockResolvedValue({}),
    close: jest.fn().mockResolvedValue({}),
    readyState: 0
  },
  Schema: jest.fn(),
  model: jest.fn(),
  Types: {
    ObjectId: jest.fn().mockImplementation((id) => {
      if (id) {
        return { toString: () => id, _id: id };
      }
      return { toString: () => '507f1f77bcf86cd799439011', _id: '507f1f77bcf86cd799439011' };
    })
  }
}));

// Mock de la configuración de base de datos
jest.mock('./src/database/db.config', () => ({}));

// Mock de console.log para pruebas más limpias
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock de Socket.io para pruebas
jest.mock('socket.io', () => {
  return {
    Server: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      emit: jest.fn(),
      use: jest.fn(),
    })),
  };
});

// Mock de AMQP para pruebas
jest.mock('amqplib', () => ({
  connect: jest.fn().mockResolvedValue({
    createChannel: jest.fn().mockResolvedValue({
      assertQueue: jest.fn(),
      consume: jest.fn(),
      sendToQueue: jest.fn(),
      close: jest.fn(),
    }),
    close: jest.fn(),
  }),
}));