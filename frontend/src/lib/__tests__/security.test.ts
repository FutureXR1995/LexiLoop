import { ValidationService, CSRFService, JWTService } from '../security';

describe('Security Services', () => {
  describe('ValidationService', () => {
    describe('sanitizeString', () => {
      it('should remove HTML tags', () => {
        const input = '<script>alert("xss")</script>Hello';
        const result = ValidationService.sanitizeString(input);
        expect(result).toBe('scriptalert("xss")/scriptHello');
      });

      it('should remove javascript protocols', () => {
        const input = 'javascript:alert("xss")';
        const result = ValidationService.sanitizeString(input);
        expect(result).toBe('alert("xss")');
      });

      it('should remove event handlers', () => {
        const input = 'onclick=alert("xss")';
        const result = ValidationService.sanitizeString(input);
        expect(result).toBe('alert("xss")');
      });

      it('should trim whitespace', () => {
        const input = '  hello world  ';
        const result = ValidationService.sanitizeString(input);
        expect(result).toBe('hello world');
      });
    });

    describe('isValidEmail', () => {
      it('should accept valid email addresses', () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'user+tag@example.org',
        ];

        validEmails.forEach(email => {
          expect(ValidationService.isValidEmail(email)).toBe(true);
        });
      });

      it('should reject invalid email addresses', () => {
        const invalidEmails = [
          'invalid',
          '@example.com',
          'test@',
          'test@.com',
          'test..test@example.com',
        ];

        invalidEmails.forEach(email => {
          expect(ValidationService.isValidEmail(email)).toBe(false);
        });
      });

      it('should reject emails that are too long', () => {
        const longEmail = 'a'.repeat(250) + '@example.com';
        expect(ValidationService.isValidEmail(longEmail)).toBe(false);
      });
    });

    describe('isValidPassword', () => {
      it('should accept strong passwords', () => {
        const validPasswords = [
          'Password123!',
          'MyStr0ng@Pass',
          'Complex1$',
        ];

        validPasswords.forEach(password => {
          expect(ValidationService.isValidPassword(password)).toBe(true);
        });
      });

      it('should reject weak passwords', () => {
        const invalidPasswords = [
          'password', // no uppercase, number, special char
          'PASSWORD', // no lowercase, number, special char
          '12345678', // no letters, special char
          'Pass123', // no special char, too short
          'Pass!', // too short
        ];

        invalidPasswords.forEach(password => {
          expect(ValidationService.isValidPassword(password)).toBe(false);
        });
      });
    });

    describe('validateUserInput', () => {
      it('should validate correct user input', () => {
        const validInput = {
          email: 'test@example.com',
          password: 'StrongPass123!',
          name: 'John Doe',
        };

        const result = ValidationService.validateUserInput(validInput);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should return errors for invalid input', () => {
        const invalidInput = {
          email: 'invalid-email',
          password: 'weak',
          name: 'X', // too short
        };

        const result = ValidationService.validateUserInput(invalidInput);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('CSRFService', () => {
    describe('generateToken', () => {
      it('should generate a token', () => {
        const token = CSRFService.generateToken();
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);
      });

      it('should generate unique tokens', () => {
        const token1 = CSRFService.generateToken();
        const token2 = CSRFService.generateToken();
        expect(token1).not.toBe(token2);
      });
    });

    describe('validateToken', () => {
      it('should validate fresh tokens', () => {
        const token = CSRFService.generateToken();
        const isValid = CSRFService.validateToken(token);
        expect(isValid).toBe(true);
      });

      it('should reject invalid tokens', () => {
        const invalidToken = 'invalid-token';
        const isValid = CSRFService.validateToken(invalidToken);
        expect(isValid).toBe(false);
      });

      it('should reject expired tokens', () => {
        // Create a token that appears old
        const oldTimestamp = Date.now() - 7200000; // 2 hours ago
        const oldToken = btoa(`${oldTimestamp}:randomstring`);
        const isValid = CSRFService.validateToken(oldToken, 3600000); // 1 hour max age
        expect(isValid).toBe(false);
      });
    });
  });

  describe('JWTService', () => {
    const testPayload = { userId: '123', email: 'test@example.com' };

    describe('sign and verify', () => {
      it('should sign and verify JWT tokens', async () => {
        const token = await JWTService.sign(testPayload);
        expect(typeof token).toBe('string');

        const verified = await JWTService.verify(token);
        expect(verified.userId).toBe(testPayload.userId);
        expect(verified.email).toBe(testPayload.email);
      });

      it('should reject invalid tokens', async () => {
        const invalidToken = 'invalid.jwt.token';
        await expect(JWTService.verify(invalidToken)).rejects.toThrow('Invalid token');
      });

      it('should reject tampered tokens', async () => {
        const token = await JWTService.sign(testPayload);
        const tamperedToken = token.slice(0, -5) + 'xxxxx';
        await expect(JWTService.verify(tamperedToken)).rejects.toThrow('Invalid token');
      });
    });
  });
});