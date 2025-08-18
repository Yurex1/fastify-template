export const env = {
  requireEnv: (name: string) => {
    const env = process.env[name];
    if (!env) throw new Error(`Missing required env "${name}"`);
    return env;
  },
};
