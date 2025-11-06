export type AttachmentDto = {
  attachmentId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  downloadUrl: string;   // SAS or your proxy endpoint
  expiresAt: string;     // ISO
};