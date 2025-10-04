import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    getHelloExplicit(): string;
    healthCheck(): {
        status: string;
        timestamp: string;
        uptime: number;
        environment: string;
    };
    healthCheckExplicit(): {
        status: string;
        timestamp: string;
        uptime: number;
        environment: string;
    };
}
