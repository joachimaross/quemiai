// Media service stub

interface MediaFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export function uploadMedia(_userId: string, _file: MediaFile) {
  // Simulate media upload
  return { success: true, url: 'https://cdn.jacameno.com/media/123.jpg' };
}

export function getMediaUrl(mediaId: string) {
  // Simulate fetching media URL
  return `https://cdn.jacameno.com/media/${mediaId}.jpg`;
}
