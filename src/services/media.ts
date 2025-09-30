// Media service stub
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export function uploadMedia(_userId: string, _file: any) {
  // Simulate media upload
  return { success: true, url: 'https://cdn.jacameno.com/media/123.jpg' };
}

export function getMediaUrl(mediaId: string) {
  // Simulate fetching media URL
  return `https://cdn.jacameno.com/media/${mediaId}.jpg`;
}
