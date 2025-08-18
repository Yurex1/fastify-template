type Gender = 'male' | 'female' | 'other';

export interface User {
  id: number;
  email?: string;
  phone?: string;
  name: string;
  username: string;
  password: string;
  birth: string;
  gender: Gender;
  avatar?: string;
  bio: { photos: string[]; text: string | null };
  private: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}
