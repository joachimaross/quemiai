import { ConfigService } from '@nestjs/config';
export declare class CacheService {
    private configService;
    private client;
    private readonly logger;
    private isConnected;
    constructor(configService: ConfigService);
    private initializeRedis;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    exists(key: string): Promise<boolean>;
    onModuleDestroy(): Promise<void>;
}
