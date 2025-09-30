// Media service stub
export function uploadMedia(userId: string, file: any) {
  // Simulate media upload
  return { success: true, url: 'https://cdn.jacameno.com/media/123.jpg' };
}

export function getMediaUrl(mediaId: string) {
  // Simulate fetching media URL
  return `https://cdn.jacameno.com/media/${mediaId}.jpg`;
}
