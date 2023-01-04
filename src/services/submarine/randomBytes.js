import { generateKeys } from './keys';

const randomBytes = size => {
  const bytes = Buffer.allocUnsafe(size);
  global.crypto.getRandomValues(bytes);

  return bytes;
};

export { generateKeys, randomBytes };
