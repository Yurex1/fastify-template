export interface FirebaseConfigs {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  vapidKey: string;
}
export interface NotificationResponse {
  invalidTokens: string[];
}
