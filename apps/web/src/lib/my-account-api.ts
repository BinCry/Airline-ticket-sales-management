import {
  ApiClientError,
  requestApi,
  resolveApiClientErrorMessage
} from "@/lib/api-client";

export interface MyProfile {
  id: number;
  email: string;
  displayName: string;
  phone: string | null;
  emailVerified: boolean;
  status: string;
  roles: string[];
}

export interface UpdateMyProfilePayload {
  displayName: string;
  phone: string;
}

export interface MyPassenger {
  id: number;
  fullName: string;
  passengerType: string;
  dateOfBirth: string;
  documentType: string;
  documentNumber: string;
  isPrimary: boolean;
}

export interface UpsertMyPassengerPayload {
  fullName: string;
  passengerType: string;
  dateOfBirth: string;
  documentType: string;
  documentNumber: string;
  isPrimary: boolean;
}

export class MyAccountApiError extends ApiClientError {
  constructor(
    message: string,
    status: number,
    errors: Record<string, string> = {},
    timestamp: string | null = null
  ) {
    super(message, status, errors, timestamp);
    this.name = "MyAccountApiError";
  }
}

function toMyAccountApiError(error: unknown): never {
  if (error instanceof ApiClientError) {
    throw new MyAccountApiError(error.message, error.status, error.errors, error.timestamp);
  }

  throw error;
}

function sanitizeRoles(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function isMyProfile(value: unknown): value is MyProfile {
  if (!value || typeof value !== "object") {
    return false;
  }

  const profile = value as Partial<MyProfile>;

  return (
    typeof profile.id === "number" &&
    typeof profile.email === "string" &&
    typeof profile.displayName === "string" &&
    (profile.phone === null || typeof profile.phone === "string" || typeof profile.phone === "undefined") &&
    typeof profile.emailVerified === "boolean" &&
    typeof profile.status === "string" &&
    Array.isArray(profile.roles)
  );
}

function isMyPassenger(value: unknown): value is MyPassenger {
  if (!value || typeof value !== "object") {
    return false;
  }

  const passenger = value as Partial<MyPassenger>;

  return (
    typeof passenger.id === "number" &&
    typeof passenger.fullName === "string" &&
    typeof passenger.passengerType === "string" &&
    typeof passenger.dateOfBirth === "string" &&
    typeof passenger.documentType === "string" &&
    typeof passenger.documentNumber === "string" &&
    typeof passenger.isPrimary === "boolean"
  );
}

function isMyPassengerList(value: unknown): value is MyPassenger[] {
  return Array.isArray(value) && value.every((item) => isMyPassenger(item));
}

function normalizeMyProfile(payload: MyProfile): MyProfile {
  return {
    ...payload,
    phone: payload.phone ?? null,
    roles: sanitizeRoles(payload.roles)
  };
}

async function sendProfileMutation(
  accessToken: string,
  endpoint: string,
  method: "GET" | "PATCH",
  payload?: UpdateMyProfilePayload
): Promise<MyProfile> {
  let result: unknown;

  try {
    result = await requestApi<unknown>(endpoint, {
      accessToken,
      fallbackMessage:
        method === "GET"
          ? "Không thể tải dữ liệu tài khoản lúc này."
          : "Không thể cập nhật hồ sơ tài khoản lúc này.",
      json: payload,
      method
    });
  } catch (error) {
    return toMyAccountApiError(error);
  }

  if (!isMyProfile(result)) {
    throw new MyAccountApiError("Dữ liệu hồ sơ trả về không hợp lệ.", 500);
  }

  return normalizeMyProfile(result);
}

export function fetchMyProfile(accessToken: string): Promise<MyProfile> {
  return sendProfileMutation(accessToken, "/api/me/profile", "GET");
}

export function updateMyProfile(
  accessToken: string,
  payload: UpdateMyProfilePayload
): Promise<MyProfile> {
  return sendProfileMutation(accessToken, "/api/me/profile", "PATCH", payload);
}

export async function fetchMyPassengers(accessToken: string): Promise<MyPassenger[]> {
  let payload: unknown;

  try {
    payload = await requestApi<unknown>("/api/me/passengers", {
      accessToken,
      fallbackMessage: "Không thể tải danh sách hành khách lúc này.",
      method: "GET"
    });
  } catch (error) {
    return toMyAccountApiError(error);
  }

  if (!isMyPassengerList(payload)) {
    throw new MyAccountApiError("Dữ liệu hành khách trả về không hợp lệ.", 500);
  }

  return payload;
}

async function sendPassengerMutation(
  accessToken: string,
  endpoint: string,
  method: "POST" | "PATCH",
  payload: UpsertMyPassengerPayload
): Promise<MyPassenger> {
  let result: unknown;

  try {
    result = await requestApi<unknown>(endpoint, {
      accessToken,
      fallbackMessage: "Không thể lưu hành khách lúc này.",
      json: payload,
      method
    });
  } catch (error) {
    return toMyAccountApiError(error);
  }

  if (!isMyPassenger(result)) {
    throw new MyAccountApiError("Dữ liệu hành khách trả về không hợp lệ.", 500);
  }

  return result;
}

export function createMyPassenger(
  accessToken: string,
  payload: UpsertMyPassengerPayload
): Promise<MyPassenger> {
  return sendPassengerMutation(accessToken, "/api/me/passengers", "POST", payload);
}

export function updateMyPassenger(
  accessToken: string,
  passengerId: number,
  payload: UpsertMyPassengerPayload
): Promise<MyPassenger> {
  return sendPassengerMutation(accessToken, `/api/me/passengers/${passengerId}`, "PATCH", payload);
}

export async function deleteMyPassenger(
  accessToken: string,
  passengerId: number
): Promise<void> {
  try {
    await requestApi<void>(`/api/me/passengers/${passengerId}`, {
      accessToken,
      fallbackMessage: "Không thể xóa hành khách lúc này.",
      method: "DELETE"
    });
  } catch (error) {
    return toMyAccountApiError(error);
  }
}

export function resolveMyAccountErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  return resolveApiClientErrorMessage(error, fallbackMessage);
}
