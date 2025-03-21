import * as Crypto from 'expo-crypto';

export const generateUUID = async (): Promise<string> => {
  const array = new Uint8Array(16);
  Crypto.getRandomValues(array);
  
  // Convert to hex string
  const hex = Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Format as UUID
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}; 