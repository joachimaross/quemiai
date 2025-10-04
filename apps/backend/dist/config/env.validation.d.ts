declare enum Environment {
    Development = "development",
    Production = "production",
    Test = "test",
    Staging = "staging"
}
declare class EnvironmentVariables {
    NODE_ENV: Environment;
    PORT: number;
    DATABASE_URL?: string;
    JWT_SECRET?: string;
    LOG_LEVEL?: string;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};
