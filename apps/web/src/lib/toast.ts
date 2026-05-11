export type ToastTone = "info" | "success" | "warning" | "danger";

export interface ToastPayload {
  durationMs?: number;
  id: string;
  message: string;
  title?: string;
  tone?: ToastTone;
}

const TOAST_EVENT_NAME = "qlvmb:toast";

function generateToastId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function pushToast(toast: Omit<ToastPayload, "id"> & { id?: string }) {
  if (typeof window === "undefined") {
    return;
  }

  const detail: ToastPayload = {
    durationMs: toast.durationMs,
    id: toast.id ?? generateToastId(),
    message: toast.message,
    title: toast.title,
    tone: toast.tone ?? "info"
  };

  window.dispatchEvent(
    new CustomEvent<ToastPayload>(TOAST_EVENT_NAME, {
      detail
    })
  );
}

export function subscribeToast(listener: (toast: ToastPayload) => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  function handleToast(event: Event) {
    const customEvent = event as CustomEvent<ToastPayload>;
    if (customEvent.detail) {
      listener(customEvent.detail);
    }
  }

  window.addEventListener(TOAST_EVENT_NAME, handleToast as EventListener);

  return () => {
    window.removeEventListener(TOAST_EVENT_NAME, handleToast as EventListener);
  };
}

