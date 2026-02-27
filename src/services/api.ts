import axios from 'axios';
import type { DeliveryRequest, SubmissionResponse } from '../types/index';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function submitDeliveryRequest(
  data: Partial<DeliveryRequest>
): Promise<SubmissionResponse> {
  const response = await api.post('/api/submissions', data);
  return response.data;
}

export async function getSubmissionStatus(referenceNumber: string) {
  const response = await api.get(`/api/submissions/${referenceNumber}`);
  return response.data;
}

export default api;
