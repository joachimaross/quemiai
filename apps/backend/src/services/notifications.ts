// Notifications service stub
export function sendNotification(_userId: string, message: string) {
  // Simulate sending a notification
  return { success: true, userId: _userId, message };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getNotifications(_userId: string) {
  // Simulate fetching notifications
  return [
    { id: '1', message: 'Welcome to Jacameno!', read: false },
    { id: '2', message: 'You have a new follower.', read: false },
  ];
}
