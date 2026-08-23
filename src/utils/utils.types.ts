import type { HttpCodeValue } from './statusCode.js';
export interface ApiErrorProps {
  statusCode: HttpCodeValue;
  message?: string;
  errors?: any[];
  stack?: string;
}
export interface ApiResponseProps<T = any> {
  message?: string;
  data?: T;
}
