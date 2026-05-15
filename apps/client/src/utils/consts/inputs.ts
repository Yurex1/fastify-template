export const REGISTER_INPUT_CONFIGS = [
  {
    id: 1,
    name: 'email' as const,
    placeholder: 'Email',
    autoComplete: 'email',
  },
  {
    id: 2,
    name: 'username' as const,
    placeholder: 'Username',
    autoComplete: 'username',
  },
] as const;
