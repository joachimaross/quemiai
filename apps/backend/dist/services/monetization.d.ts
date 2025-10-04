export declare function getAvailablePlans(): {
    id: string;
    name: string;
    price: number;
}[];
export declare function purchasePlan(userId: string, planId: string): {
    success: boolean;
    userId: string;
    planId: string;
};
