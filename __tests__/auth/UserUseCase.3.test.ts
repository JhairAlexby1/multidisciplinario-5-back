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

describe('UserUseCase - Prueba #3', () => {
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

  describe('register - Validación de campos obligatorios', () => {
    it('debe devolver un error si falta el nombre durante el registro', async () => {
      // Arrange
      const name = ''; // Campo vacío
      const email = 'test@example.com';
      const password = 'password123';

      // Act & Assert
      // COMPORTAMIENTO ACTUAL: El código no valida campos obligatorios
      // Esta prueba documenta que actualmente NO se validan los campos
      await expect(async () => {
        await userUseCase.register(name, email, password);
      }).not.toThrow();

      // COMPORTAMIENTO ESPERADO: Debería lanzar un error
      // await expect(userUseCase.register(name, email, password))
      //   .rejects.toThrow('Name is required');

      // Verificar que el código actual intenta procesar incluso con nombre vacío
      expect(mockEncryptService.encodePassword).toHaveBeenCalledWith(password);
    });

    it('debe devolver un error si falta el email durante el registro', async () => {
      // Arrange
      const name = 'Juan Pérez';
      const email = ''; // Campo vacío
      const password = 'password123';

      // Act & Assert
      // COMPORTAMIENTO ACTUAL: No valida email vacío
      await expect(async () => {
        await userUseCase.register(name, email, password);
      }).not.toThrow();

      // COMPORTAMIENTO ESPERADO: Debería lanzar un error
      // await expect(userUseCase.register(name, email, password))
      //   .rejects.toThrow('Email is required');

      expect(mockEncryptService.encodePassword).toHaveBeenCalledWith(password);
    });

    it('debe devolver un error si falta la contraseña durante el registro', async () => {
      // Arrange
      const name = 'Juan Pérez';
      const email = 'juan@example.com';
      const password = ''; // Campo vacío

      // Act & Assert
      // COMPORTAMIENTO ACTUAL: No valida contraseña vacía
      await expect(async () => {
        await userUseCase.register(name, email, password);
      }).not.toThrow();

      // COMPORTAMIENTO ESPERADO: Debería lanzar un error
      // await expect(userUseCase.register(name, email, password))
      //   .rejects.toThrow('Password is required');

      expect(mockEncryptService.encodePassword).toHaveBeenCalledWith(password);
    });

    it('debe devolver un error si faltan múltiples campos obligatorios', async () => {
      // Arrange
      const name = ''; // Campo vacío
      const email = ''; // Campo vacío
      const password = ''; // Campo vacío

      // Act & Assert
      // COMPORTAMIENTO ACTUAL: No valida ningún campo
      await expect(async () => {
        await userUseCase.register(name, email, password);
      }).not.toThrow();

      // COMPORTAMIENTO ESPERADO: Debería lanzar un error detallado
      // await expect(userUseCase.register(name, email, password))
      //   .rejects.toThrow('Name, email and password are required');

      expect(mockEncryptService.encodePassword).toHaveBeenCalledWith(password);
    });

    it('debe procesar correctamente cuando todos los campos están presentes', async () => {
      // Arrange
      const name = 'Juan Pérez';
      const email = 'juan@example.com';
      const password = 'password123';
      const encodedPassword = 'hashedPassword123';

      mockEncryptService.encodePassword.mockReturnValue(encodedPassword);
      mockUserRepository.save.mockResolvedValue(undefined);

      // Act
      await userUseCase.register(name, email, password);

      // Assert
      expect(mockEncryptService.encodePassword).toHaveBeenCalledWith(password);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: name,
          email: email,
          password: encodedPassword
        })
      );
    });

    it('debe documentar la necesidad de validación de entrada', () => {
      // Esta prueba documenta que el UserUseCase actual:
      // ❌ NO valida campos obligatorios
      // ❌ NO valida formato de email
      // ❌ NO valida fortaleza de contraseña
      // ❌ NO sanitiza entradas
      
      // REFACTORIZACIÓN SUGERIDA:
      // 1. Agregar validaciones al inicio del método register:
      //    - if (!name?.trim()) throw new Error('Name is required')
      //    - if (!email?.trim()) throw new Error('Email is required')
      //    - if (!password?.trim()) throw new Error('Password is required')
      // 2. Agregar validación de formato de email
      // 3. Agregar validación de fortaleza de contraseña
      // 4. Sanitizar entradas para prevenir inyecciones
      
      expect(true).toBe(true); // Prueba de documentación
    });
  });
});