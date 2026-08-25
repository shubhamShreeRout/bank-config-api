export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}
export const ok = <T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> => ({
  success: true,
  data,
  ...(meta ? { meta } : {}),
});
