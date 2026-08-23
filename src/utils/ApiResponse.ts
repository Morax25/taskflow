import type { ApiResponseProps } from './utils.types.js';

class ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;

  constructor({ message = 'Success', data }: ApiResponseProps<T>) {
    this.success = true;
    this.message = message;
    this.data = data as T;
  }
}

export default ApiResponse;
