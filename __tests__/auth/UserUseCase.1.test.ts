import { UserUseCase } from '../../src/auth/application/UserUseCase';
import { UserRepository } from '../../src/auth/domain/userRepository';
import { IEcryptService } from '../../src/auth/application/services/IEncryptService';
import { IJwtService } from '../../src/auth/application/services/IJWTService';
import { IUser } from '../../src/auth/domain/Iuser';

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

describe('UserUseCase', () => {
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
    it('debe registrar un nuevo usuario de forma exitosa cuando los datos son válidos', async () => {
      // Arrange (Preparar)
      const name = 'Juan Pérez';
      const email = 'juan.perez@example.com';
      const password = 'password123';
      const encodedPassword = 'hashedPassword123';

      // Configurar mocks
      mockEncryptService.encodePassword.mockReturnValue(encodedPassword);
      mockUserRepository.save.mockResolvedValue();

      // Act (Actuar)
      await userUseCase.register(name, email, password);

      // Assert (Verificar)
      // Verificar que se llamó al servicio de encriptación con la contraseña correcta
      expect(mockEncryptService.encodePassword).toHaveBeenCalledWith(password);
      expect(mockEncryptService.encodePassword).toHaveBeenCalledTimes(1);

      // Verificar que se creó el usuario con los datos correctos
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: name,
          email: email,
          password: encodedPassword
        })
      );
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);

      // Verificar que el objeto pasado al repositorio es una instancia de IUser
      const savedUser = mockUserRepository.save.mock.calls[0][0];
      expect(savedUser).toBeInstanceOf(IUser);
      expect(savedUser.name).toBe(name);
      expect(savedUser.email).toBe(email);
      expect(savedUser.password).toBe(encodedPassword);
    });

    it('debe lanzar un error cuando el servicio de encriptación falla', async () => {
      // Arrange
      const name = 'Juan Pérez';
      const email = 'juan.perez@example.com';
      const password = 'password123';
      const encryptError = new Error('Error de encriptación');

      mockEncryptService.encodePassword.mockImplementation(() => {
        throw encryptError;
      });

      // Act & Assert
      await expect(userUseCase.register(name, email, password))
        .rejects.toThrow('Error de encriptación');

      // Verificar que no se intentó guardar el usuario
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('debe lanzar un error cuando el repositorio falla al guardar', async () => {
      // Arrange
      const name = 'Juan Pérez';
      const email = 'juan.perez@example.com';
      const password = 'password123';
      const encodedPassword = 'hashedPassword123';
      const saveError = new Error('Error al guardar en base de datos');

      mockEncryptService.encodePassword.mockReturnValue(encodedPassword);
      mockUserRepository.save.mockRejectedValue(saveError);

      // Act & Assert
      await expect(userUseCase.register(name, email, password))
        .rejects.toThrow('Error al guardar en base de datos');

      // Verificar que se intentó encriptar la contraseña
      expect(mockEncryptService.encodePassword).toHaveBeenCalledWith(password);
    });
  });
});