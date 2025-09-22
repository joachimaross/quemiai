import request from 'supertest';
import { db } from '../../config';
import bcrypt from 'bcrypt';
import app from '../../functions/api'; // Correctly import the app

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    applicationDefault: jest.fn(),
  },
  firestore: () => ({
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        get: jest.fn(() =>
          Promise.resolve({
            empty: true,
            docs: [],
          }),
        ),
      })),
      add: jest.fn(() =>
        Promise.resolve({
          id: 'testUserId',
        }),
      ),
    })),
  }),
  auth: () => ({}),
}));

// Mock dotenv/config
jest.mock('dotenv/config', () => ({}));

describe('Auth API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      (db.collection as jest.Mock).mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ empty: true }),
        add: jest.fn().mockResolvedValue({ id: 'testUserId' }),
      });

      const res = await request(app).post('/register').send({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully');
      expect(res.body).toHaveProperty('token');
    });

    it('should return 400 if user already exists', async () => {
      (db.collection as jest.Mock).mockReturnValueOnce({
        where: jest.fn(() => ({
          get: jest.fn(() =>
            Promise.resolve({
              empty: false,
              docs: [{ data: () => ({ email: 'existing@example.com' }) }],
            }),
          ),
        })),
      });

      const res = await request(app).post('/register').send({
        email: 'existing@example.com',
        password: 'password123',
        username: 'existinguser',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'User with that email already exists.');
    });

    it('should return 400 for invalid input (e.g., short password)', async () => {
      const res = await request(app).post('/register').send({
        email: 'invalid@example.com',
        password: 'short',
        username: 'invaliduser',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toHaveProperty(
        'msg',
        'Password must be at least 6 characters long',
      );
    });
  });

  describe('POST /login', () => {
    it('should log in an existing user successfully', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      (db.collection as jest.Mock).mockReturnValueOnce({
        where: jest.fn(() => ({
          get: jest.fn(() =>
            Promise.resolve({
              empty: false,
              docs: [
                {
                  id: 'testUserId',
                  data: () => ({
                    email: 'login@example.com',
                    password: hashedPassword,
                  }),
                },
              ],
            }),
          ),
        })),
      });

      const res = await request(app).post('/login').send({
        email: 'login@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Logged in successfully');
      expect(res.body).toHaveProperty('token');
    });

    it('should return 400 for invalid credentials (user not found)', async () => {
      (db.collection as jest.Mock).mockReturnValueOnce({
        where: jest.fn(() => ({
          get: jest.fn(() =>
            Promise.resolve({
              empty: true,
            }),
          ),
        })),
      });

      const res = await request(app).post('/login').send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid credentials.');
    });

    it('should return 400 for invalid credentials (wrong password)', async () => {
      const hashedPassword = await bcrypt.hash('wrongpassword', 10);
      (db.collection as jest.Mock).mockReturnValueOnce({
        where: jest.fn(() => ({
          get: jest.fn(() =>
            Promise.resolve({
              empty: false,
              docs: [
                {
                  id: 'testUserId',
                  data: () => ({
                    email: 'wrongpass@example.com',
                    password: hashedPassword,
                  }),
                },
              ],
            }),
          ),
        })),
      });

      const res = await request(app).post('/login').send({
        email: 'wrongpass@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid credentials.');
    });
  });
});
