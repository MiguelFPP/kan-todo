export interface IStorageService {
  uploadFile(file: Buffer, path: string, mimeType: string): Promise<string>;
  getSignedUrl(key: string): Promise<string>;
  deleteFile(key: string): Promise<void>;
}

export const IStorageService = Symbol('IStorageService');
