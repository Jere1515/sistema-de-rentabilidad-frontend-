import React, { useMemo, useState } from "react";
import { marcarEntrada } from "../../services/horasService";
import { notifyError, notifySuccess } from "../../utils/notify";

const getTodayKey = () => {
  const today = new Date().toISOString().split("T")[0];
  return `marcaje_entrada_${today}`;
};

const ButtonMarcaje = () => {
  const storageKey = useMemo(() => getTodayKey(), []);
  const [loading, setLoading] = useState(false);
  const [entradaMarcada, setEntradaMarcada] = useState(localStorage.getItem(storageKey) === "true");
  const [estado, setEstado] = useState("idle");
  const [mensaje, setMensaje] = useState("");

  const handleMarcarEntrada = async () => {
    if (loading || entradaMarcada) return;

    try {
      setLoading(true);
      setEstado("idle");
      setMensaje("");

      const res = await marcarEntrada();
      const okMessage = res?.message || "Entrada registrada correctamente";

      setEntradaMarcada(true);
      setEstado("success");
      setMensaje(okMessage);
      localStorage.setItem(storageKey, "true");
      notifySuccess(okMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "No se pudo registrar la entrada.";
      setEstado("error");
      setMensaje(errorMessage);
      notifyError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        className="btn btn-sm w-100 btn-success fw-bold"
        onClick={handleMarcarEntrada}
        disabled={loading || entradaMarcada}
      >
        <i className={`bi ${loading ? "bi-hourglass-split" : "bi-box-arrow-in-right"} me-2`}></i>
        {loading ? "Marcando..." : entradaMarcada ? "Entrada marcada" : "Marcar Entrada"}
      </button>

      {estado === "success" && (
        <div className="alert alert-success py-2 small mb-0 mt-2 border-0 text-center">
          {mensaje}
        </div>
      )}

      {estado === "error" && (
        <div className="alert alert-danger py-2 small mb-0 mt-2 border-0 text-center">
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default ButtonMarcaje;
