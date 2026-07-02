/**
 * Common API Response wrapper contract.
 */
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
  };
}

/**
 * Standard Paginated Response metadata interface.
 */
export interface PaginatedMeta {
  readonly page: number;
  readonly limit: number;
  readonly totalItems: number;
  readonly totalPages: number;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<readonly T[]> {
  readonly meta: PaginatedMeta;
}
