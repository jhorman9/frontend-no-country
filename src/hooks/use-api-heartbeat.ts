import { useEffect } from "react";

const API_HEALTH_URL = "https://elevideo.onrender.com/api/health";
const HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 minutos

export const useApiHeartbeat = () => {
  useEffect(() => {
    // Hacer una petición inicial
    const pingApi = async () => {
      try {
        await fetch(API_HEALTH_URL);
      } catch (error) {
        console.error("Error en heartbeat de API:", error);
      }
    };

    // Primera petición inmediata
    pingApi();

    // Peticiones periódicas
    const interval = setInterval(pingApi, HEARTBEAT_INTERVAL);

    // Limpiar intervalo al desmontar
    return () => clearInterval(interval);
  }, []);
};
