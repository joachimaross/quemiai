export declare function sendNotification(_userId: string, message: string): {
    success: boolean;
    userId: string;
    message: string;
};
export declare function getNotifications(_userId: string): {
    id: string;
    message: string;
    read: boolean;
}[];
