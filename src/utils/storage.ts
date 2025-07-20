
/**
 * Secure Local Storage Management
 * Handles encrypted file storage in IndexedDB with metadata management
 */

import { EncryptedFile, FileMetadata } from './encryption';

const DB_NAME = 'SecureFileStorage';
const DB_VERSION = 1;
const FILES_STORE = 'encrypted_files';
const METADATA_STORE = 'file_metadata';

/**
 * Initialize IndexedDB for secure file storage
 */
export async function initializeDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create encrypted files store
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        const filesStore = db.createObjectStore(FILES_STORE, { keyPath: 'id' });
        filesStore.createIndex('filename', 'filename', { unique: false });
        filesStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Create metadata store
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        const metadataStore = db.createObjectStore(METADATA_STORE, { keyPath: 'id' });
        metadataStore.createIndex('filename', 'filename', { unique: false });
        metadataStore.createIndex('uploadDate', 'uploadDate', { unique: false });
      }
    };
  });
}

/**
 * Store encrypted file securely in IndexedDB
 */
export async function storeEncryptedFile(encryptedFile: EncryptedFile): Promise<string> {
  const db = await initializeDB();
  const fileId = crypto.randomUUID();
  
  const transaction = db.transaction([FILES_STORE, METADATA_STORE], 'readwrite');
  
  // Store encrypted file data
  const filesStore = transaction.objectStore(FILES_STORE);
  await new Promise<void>((resolve, reject) => {
    const request = filesStore.add({
      id: fileId,
      ...encryptedFile
    });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  
  // Store metadata for quick access
  const metadataStore = transaction.objectStore(METADATA_STORE);
  const metadata: FileMetadata = {
    id: fileId,
    filename: encryptedFile.filename,
    size: encryptedFile.originalSize,
    uploadDate: new Date(encryptedFile.timestamp).toISOString(),
    encrypted: true,
    checksum: encryptedFile.checksum
  };
  
  await new Promise<void>((resolve, reject) => {
    const request = metadataStore.add(metadata);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  
  console.log(`File stored securely with ID: ${fileId}`);
  return fileId;
}

/**
 * Retrieve encrypted file from IndexedDB
 */
export async function getEncryptedFile(fileId: string): Promise<EncryptedFile | null> {
  const db = await initializeDB();
  const transaction = db.transaction([FILES_STORE], 'readonly');
  const store = transaction.objectStore(FILES_STORE);
  
  return new Promise((resolve, reject) => {
    const request = store.get(fileId);
    request.onsuccess = () => {
      const result = request.result;
      if (result) {
        const { id, ...encryptedFile } = result;
        resolve(encryptedFile as EncryptedFile);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all file metadata for display
 */
export async function getAllFileMetadata(): Promise<FileMetadata[]> {
  const db = await initializeDB();
  const transaction = db.transaction([METADATA_STORE], 'readonly');
  const store = transaction.objectStore(METADATA_STORE);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete encrypted file and its metadata
 */
export async function deleteEncryptedFile(fileId: string): Promise<void> {
  const db = await initializeDB();
  const transaction = db.transaction([FILES_STORE, METADATA_STORE], 'readwrite');
  
  const filesStore = transaction.objectStore(FILES_STORE);
  const metadataStore = transaction.objectStore(METADATA_STORE);
  
  await Promise.all([
    new Promise<void>((resolve, reject) => {
      const request = filesStore.delete(fileId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    }),
    new Promise<void>((resolve, reject) => {
      const request = metadataStore.delete(fileId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    })
  ]);
  
  console.log(`File deleted: ${fileId}`);
}

/**
 * Clear all stored files (for security/privacy)
 */
export async function clearAllFiles(): Promise<void> {
  const db = await initializeDB();
  const transaction = db.transaction([FILES_STORE, METADATA_STORE], 'readwrite');
  
  await Promise.all([
    new Promise<void>((resolve, reject) => {
      const request = transaction.objectStore(FILES_STORE).clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    }),
    new Promise<void>((resolve, reject) => {
      const request = transaction.objectStore(METADATA_STORE).clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    })
  ]);
  
  console.log('All files cleared from storage');
}
