export interface SignUp {
  email: string;
  username: string;
  password: string;
}
export interface SignIn {
  usernameOrEmail: string;
  password: string;
}
export interface ChangePassword {
  oldPassword: string;
  newPassword: string;
}
