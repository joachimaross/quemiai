// Monetization service stub
export function getAvailablePlans() {
  return [
    { id: 'basic', name: 'Basic', price: 0 },
    { id: 'pro', name: 'Pro', price: 9.99 },
    { id: 'creator', name: 'Creator', price: 29.99 },
  ];
}

export function purchasePlan(userId: string, planId: string) {
  // Simulate purchase logic
  return { success: true, userId, planId };
}
