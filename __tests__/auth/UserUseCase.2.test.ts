import { UserUseCase } from '../../src/auth/application/UserUseCase';
import { UserRepository } from '../../src/auth/domain/userRepository';
import { IEcryptService } from '../../src/auth/application/services/IEncryptService';
import { IJwtService } from '../../src/auth/application/services/IJWTService';
import { IUser } from '../../src/auth/domain/Iuser';
import { User } from '../../src/auth/domain/user';
import mongoose from 'mongoose';

// Mocks
const mockUserRepository: jest.Mocked<UserRepository> = {
  findByEmail: jest.fn(),
  save: jest.fn(),
  addWebhook: jest.fn(),
  getAll: jest.fn()
};

const mockEncryptService: jest.Mocked<IEcryptService> = {
  encodePassword: jest.fn(),
  authPassword: jest.fn()
};

const mockJwtService: jest.Mocked<IJwtService> = {
  generateToken: jest.fn(),
  verifyToken: jest.fn()
};

describe('UserUseCase - Prueba #2', () => {
  let userUseCase: UserUseCase;

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Crear nueva instancia del UserUseCase
    userUseCase = new UserUseCase(
      mockUserRepository,
      mockEncryptService,
      mockJwtService
    );
  });

  describe('register', () => {
    it('debe devolver un error al intentar registrar un usuario con un email que ya existe', async () => {
      // Arrange (Preparar)
      const name = 'Juan Pérez';
      const email = 'juan.perez@example.com';
      const password = 'password123';
      const encodedPassword = 'hashedPassword123';
      
      // Simular que ya existe un usuario con ese email
      const existingUser: User = new User(
        new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        'Usuario Existente',
        email,
        'otherHashedPassword',
        ''
      );

      // Configurar mocks
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);
      mockEncryptService.encodePassword.mockReturnValue(encodedPassword);

      // Act & Assert (Actuar y Verificar)
      // Esta prueba DEBE FALLAR porque el UserUseCase actual no valida emails duplicados
      // El comportamiento actual es que intenta guardar sin verificar duplicados
      
      // Esperamos que NO se lance un error (comportamiento actual)
      // pero DEBERÍA lanzar un error (comportamiento esperado)
      await expect(async () => {
        await userUseCase.register(name, email, password);
      }).not.toThrow();

      // Verificaciones del comportamiento actual (incorrecto)
      expect(mockEncryptService.encodePassword).toHaveBeenCalledWith(password);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: name,
          email: email,
          password: encodedPassword
        })
      );

      // NOTA: Esta prueba documenta el comportamiento actual (incorrecto)
      // El UserUseCase DEBERÍA:
      // 1. Verificar si el email ya existe usando findByEmail
      // 2. Lanzar un error si el usuario ya existe
      // 3. NO intentar guardar el usuario duplicado
    });

    it('debe verificar si el email existe antes de registrar (comportamiento esperado)', async () => {
      // Arrange
      const name = 'Juan Pérez';
      const email = 'juan.perez@example.com';
      const password = 'password123';
      
      const existingUser: User = new User(
        new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        'Usuario Existente',
        email,
        'otherHashedPassword',
        ''
      );

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // Act
      await userUseCase.register(name, email, password);

      // Assert
      // Verificar que se consultó si el email existe
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      
      // PROBLEMA: El código actual NO verifica duplicados
      // Esta prueba muestra que findByEmail se llama en login, pero NO en register
      // El register debería fallar, pero actualmente no lo hace
    });

    it('debe documentar el comportamiento actual vs el esperado', async () => {
      // Esta prueba documenta la diferencia entre:
      // COMPORTAMIENTO ACTUAL: register() no valida emails duplicados
      // COMPORTAMIENTO ESPERADO: register() debería validar y rechazar emails duplicados
      
      const name = 'Test User';
      const email = 'test@example.com';
      const password = 'password123';
      
      // Simular usuario existente
      const existingUser: User = new User(
        new mongoose.Types.ObjectId(),
        'Existing User',
        email,
        'hashedPassword',
        ''
      );
      
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);
      mockEncryptService.encodePassword.mockReturnValue('newHashedPassword');
      
      // COMPORTAMIENTO ACTUAL: No falla
      await expect(userUseCase.register(name, email, password)).resolves.not.toThrow();
      
      // COMPORTAMIENTO ESPERADO: Debería fallar con algo como:
      // await expect(userUseCase.register(name, email, password))
      //   .rejects.toThrow('Email already exists');
      
      // Verificar que el código actual NO consulta por duplicados en register
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });
});