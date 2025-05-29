
export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    user_role: 'admin' | 'member';
    role: string;
    is_active: boolean;
  };
  error?: string;
}
