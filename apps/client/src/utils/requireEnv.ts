export const env = {
  requireEnv: (name: string) => {
    const env = import.meta.env[name];
    if (!env) throw new Error(`Missing required env "${name}"`);
    return env;
  },
};
