import { EncryptService } from '../../src/auth/infraestructure/helpers/EncryptService';
import bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('EncryptService - Pruebas Unitarias', () => {
  let encryptService: EncryptService;

  beforeEach(() => {
    jest.clearAllMocks();
    encryptService = new EncryptService();
    
    // Mock environment variable
    process.env.SALT_ROUNDS = '10';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Prueba #11: Cifrado de contraseña', () => {
    it('debe cifrar una contraseña y el resultado debe ser diferente al texto plano original', () => {
      // Arrange
      const plainPassword = 'miContraseñaSegura123';
      const hashedPassword = '$2b$10$hashedPasswordExample';
      
      mockedBcrypt.hashSync.mockReturnValue(hashedPassword);

      // Act
      const result = encryptService.encodePassword(plainPassword);

      // Assert
      expect(result).toBe(hashedPassword);
      expect(result).not.toBe(plainPassword);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(plainPassword.length);
      
      // Verificar que bcrypt.hashSync fue llamado con los parámetros correctos
      expect(mockedBcrypt.hashSync).toHaveBeenCalledWith(plainPassword, 10);
      expect(mockedBcrypt.hashSync).toHaveBeenCalledTimes(1);
    });

    it('debe usar el número correcto de salt rounds desde la variable de entorno', () => {
      // Arrange
      const plainPassword = 'testPassword';
      const customSaltRounds = '12';
      process.env.SALT_ROUNDS = customSaltRounds;
      
      mockedBcrypt.hashSync.mockReturnValue('$2b$12$hashedPassword');

      // Act
      encryptService.encodePassword(plainPassword);

      // Assert
      expect(mockedBcrypt.hashSync).toHaveBeenCalledWith(plainPassword, 12);
    });

    it('debe usar salt rounds por defecto (10) si la variable de entorno no está definida', () => {
      // Arrange
      const plainPassword = 'testPassword';
      delete process.env.SALT_ROUNDS;
      
      mockedBcrypt.hashSync.mockReturnValue('$2b$10$hashedPassword');

      // Act
      encryptService.encodePassword(plainPassword);

      // Assert
      expect(mockedBcrypt.hashSync).toHaveBeenCalledWith(plainPassword, 10);
    });
  });

  describe('Prueba #12: Validación de contraseña', () => {
    it('debe validar correctamente una contraseña en texto plano contra su versión cifrada', () => {
      // Arrange
      const plainPassword = 'miContraseñaSegura123';
      const hashedPassword = '$2b$10$hashedPasswordExample';
      
      mockedBcrypt.compareSync.mockReturnValue(true);

      // Act
      const result = encryptService.authPassword(plainPassword, hashedPassword);

      // Assert
      expect(result).toBe(true);
      expect(typeof result).toBe('boolean');
      
      // Verificar que bcrypt.compareSync fue llamado con los parámetros correctos
      expect(mockedBcrypt.compareSync).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(mockedBcrypt.compareSync).toHaveBeenCalledTimes(1);
    });

    it('debe retornar false cuando la contraseña en texto plano no coincide con la versión cifrada', () => {
      // Arrange
      const plainPassword = 'contraseñaIncorrecta';
      const hashedPassword = '$2b$10$hashedPasswordExample';
      
      mockedBcrypt.compareSync.mockReturnValue(false);

      // Act
      const result = encryptService.authPassword(plainPassword, hashedPassword);

      // Assert
      expect(result).toBe(false);
      expect(typeof result).toBe('boolean');
      
      // Verificar que bcrypt.compareSync fue llamado con los parámetros correctos
      expect(mockedBcrypt.compareSync).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(mockedBcrypt.compareSync).toHaveBeenCalledTimes(1);
    });

    it('debe manejar contraseñas vacías correctamente', () => {
      // Arrange
      const emptyPassword = '';
      const hashedPassword = '$2b$10$hashedPasswordExample';
      
      mockedBcrypt.compareSync.mockReturnValue(false);

      // Act
      const result = encryptService.authPassword(emptyPassword, hashedPassword);

      // Assert
      expect(result).toBe(false);
      expect(mockedBcrypt.compareSync).toHaveBeenCalledWith(emptyPassword, hashedPassword);
    });

    it('debe manejar hashes vacíos correctamente', () => {
      // Arrange
      const plainPassword = 'testPassword';
      const emptyHash = '';
      
      mockedBcrypt.compareSync.mockReturnValue(false);

      // Act
      const result = encryptService.authPassword(plainPassword, emptyHash);

      // Assert
      expect(result).toBe(false);
      expect(mockedBcrypt.compareSync).toHaveBeenCalledWith(plainPassword, emptyHash);
    });
  });
});