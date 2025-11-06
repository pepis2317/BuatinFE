// src/services/pushService.ts
import axios from 'axios';
import { API_URL } from '../constants/ApiUri';

export async function registerPushTokenOnServer(pushToken: string|null, authToken:string) {
  await axios.put(`${API_URL}/expo-push-token`, { expoPushToken: pushToken },{ headers:{Authorization:`Bearer ${authToken}`}});
}