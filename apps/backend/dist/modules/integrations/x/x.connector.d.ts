import { ExternalPost } from '../instagram/instagram.connector';
export declare class XConnector {
    fetchPosts(userId: string, accessToken: string): Promise<ExternalPost[]>;
    fetchDirectMessages(userId: string, accessToken: string): Promise<any[]>;
}
