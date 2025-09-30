// Notifications service stub
export function sendNotification(userId: string, message: string) {
  // Simulate sending a notification
  return { success: true, userId, message };
}

export function getNotifications(_userId: string) {
  // Simulate fetching notifications
  return [
    { id: '1', message: 'Welcome to Jacameno!', read: false },
    { id: '2', message: 'You have a new follower.', read: false },
  ];
}
