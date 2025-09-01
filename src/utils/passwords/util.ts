import crypto from 'node:crypto';

export const passwords = {
  hash: (password: string) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hashed = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');

    return `${salt}:${hashed}`;
  },

  compare: (password: string, hash: string) => {
    const [salt, hashed] = hash.split(':');

    return (
      hashed ===
      crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
    );
  },
};
