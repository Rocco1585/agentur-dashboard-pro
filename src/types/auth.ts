
export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    user_role: 'admin' | 'member' | 'kunde';
    role: string;
    is_active: boolean;
    customer_dashboard_name?: string;
  };
  error?: string;
}
