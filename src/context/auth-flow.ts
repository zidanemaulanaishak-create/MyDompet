export interface PendingSignIn {
  mode: 'signIn';
  email: string;
  password: string;
}

export interface PendingSignUp {
  mode: 'signUp';
  name: string;
  email: string;
  password: string;
}

export type PendingAuth = PendingSignIn | PendingSignUp;

let pendingAuth: PendingAuth | null = null;

export function setPendingAuth(pending: PendingAuth | null): void {
  pendingAuth = pending;
}

export function getPendingAuth(): PendingAuth | null {
  return pendingAuth;
}