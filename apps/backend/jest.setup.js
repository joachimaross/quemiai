// jest.setup.js
import 'dotenv/config';

// Mock Firebase Admin SDK globally
jest.mock('firebase-admin', () => ({
    initializeApp: jest.fn(),
    credential: {
        applicationDefault: jest.fn(),
    },
    firestore: () => ({
        collection: jest.fn(() => ({
            get: jest.fn(() =>
                Promise.resolve({
                    docs: [
                        {
                            id: 'creator1',
                            data: () => ({
                                portfolio: ['url1', 'url2'],
                                skills: ['skill1', 'skill2'],
                                rating: 4.5,
                            }),
                        },
                    ],
                }),
            ),
            doc: jest.fn(() => ({
                get: jest.fn(() =>
                    Promise.resolve({
                        exists: true,
                        id: 'creator1',
                        data: () => ({
                            portfolio: ['url1'],
                            skills: ['skill1'],
                            rating: 4.5,
                        }),
                    }),
                ),
                set: jest.fn(() => Promise.resolve()),
                update: jest.fn(() => Promise.resolve()),
            })),
            add: jest.fn(() => Promise.resolve({ id: 'mockId' })),
            where: jest.fn(() => ({
                get: jest.fn(() =>
                    Promise.resolve({
                        docs: [
                            {
                                data: () => ({ rating: 5 }),
                            },
                        ],
                    }),
                ),
            })),
        })),
        terminate: jest.fn(() => Promise.resolve()),
    }),
    auth: () => ({}),
}));

// Mock multer
jest.mock('multer', () => {
    const multer = () => ({
        single: () => (req: any, res: any, next: any) => {
            req.file = {
                buffer: Buffer.from('test'),
                originalname: 'test.jpg',
            };
            next();
        },
    });
    multer.memoryStorage = jest.fn();
    return multer;
});

// Mock other services if needed
jest.mock('../src/services/storage', () => ({
    uploadBuffer: jest.fn(() => Promise.resolve('mockUrl')),
    getPublicUrl: jest.fn(() => 'mockPublicUrl'),
}));