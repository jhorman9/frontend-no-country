export const requestNotificationPermission = async (): Promise<void> => {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  if (Notification.permission === "default") {
    try {
      await Notification.requestPermission();
    } catch {
      // silent
    }
  }
};

export const notifyProcessingComplete = (title: string, status: string): void => {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const success = String(status).toLowerCase() === "completed";
  new Notification(success ? "Procesamiento completado" : "Procesamiento finalizado con error", {
    body: `${title}: ${success ? "completado" : "falló"}`,
  });
};