import React, { useState } from "react";
import { createUser } from "../../services/usuarioService";
import api from "../../services/api";
import { notifySuccess, notifyError } from "../../utils/notify";

const UsuarioForm = ({ onCreated, onCancel, usuario }) => {
  const isEdit = Boolean(usuario);
  const [form, setForm] = useState({
    nombre: usuario?.nombre || "",
    email: usuario?.email || "",
    password: "",
    rol: usuario?.rol || "lider",
    // Nuevos campos para la mejora del Sprint 2
    monto_sueldo: usuario?.monto_sueldo || "",
    tipo_sueldo: usuario?.tipo_sueldo || "mensual",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  try {
    let response;
    
    // Preparamos el objeto con los nombres de campos que espera el backend
    const payload = {
      nombre: form.nombre,
      email: form.email,
      password: form.password,
      rol: form.rol
    };

    // Si es empleado, añadimos los campos de sueldo con los nombres de la BD
    if (form.rol === "empleado") {
      payload.monto = form.monto_sueldo;       // El backend espera 'monto'
      payload.tipo_pago = form.tipo_sueldo;   // El backend espera 'tipo_pago'
    }

    if (isEdit) {
      // Para editar, quitamos el password si está vacío
      if (!form.password) delete payload.password;
      const res = await api.put(`/usuarios/${usuario.id_usuario}`, payload);
      response = res.data;
    } else {
      response = await createUser(payload); // Usamos el payload corregido
    }

    if (response?.success || response?.user) {
      setSuccess(true);
      notifySuccess(isEdit ? "Usuario actualizado correctamente" : "Usuario creado correctamente");
      setTimeout(() => { onCreated?.(); }, 700);
    } else {
      const msg = response?.message || "Error al guardar el usuario.";
      setError(msg);
      notifyError(msg);
    }
  } catch (err) {
    const msg = err.response?.data?.message || "Empleado requiere monto y tipo de pago";
    setError(msg);
    notifyError(msg);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="card border-0 rounded-4 mb-4 animate-scaleIn overflow-hidden"
      style={{ boxShadow: "var(--shadow-md)" }}>
      <div style={{ height: 4, background: "linear-gradient(90deg, var(--primary), var(--accent))" }}></div>
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="fw-bold mb-0">{isEdit ? "Editar usuario" : "Nuevo usuario"}</h5>
            <p className="text-muted small mb-0">
              {isEdit ? "Modifica los datos del colaborador" : "Completa los datos del nuevo colaborador"}
            </p>
          </div>
          <button type="button"
            className="btn btn-sm btn-light rounded-circle p-1 lh-1 d-flex align-items-center justify-content-center"
            style={{ width: 30, height: 30 }}
            onClick={onCancel}>
            <i className="bi bi-x-lg" style={{ fontSize: 12 }}></i>
          </button>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center py-2 small rounded-3 mb-3">
            <i className="bi bi-exclamation-circle-fill me-2"></i>{error}
          </div>
        )}
        {success && (
          <div className="alert alert-success d-flex align-items-center py-2 small rounded-3 mb-3">
            <i className="bi bi-check-circle-fill me-2"></i>
            {isEdit ? "¡Usuario actualizado!" : "¡Usuario creado exitosamente!"}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12 col-sm-6">
              <label className="form-label fw-semibold small">Nombre completo</label>
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange}
                className="form-control" placeholder="Ej: Juan Pérez" required />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label fw-semibold small">Rol</label>
              <select name="rol" value={form.rol} onChange={handleChange} className="form-select" required>
                <option value="lider">Líder de equipo</option>
                <option value="empleado">Empleado</option>
              </select>
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label fw-semibold small">Correo electrónico</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                className="form-control" placeholder="usuario@empresa.com" required />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label fw-semibold small">
                Contraseña {isEdit && <span className="text-muted fw-normal">(vacío = sin cambios)</span>}
              </label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder={isEdit ? "Nueva contraseña (opcional)" : "Ej: MiPass123!"}
                  required={!isEdit}
                />
                <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPassword(!showPassword)}>
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
            </div>

            {/* SECCIÓN DINÁMICA: Sueldo solo para Empleados */}
            {form.rol === "empleado" && (
              <div className="col-12 animate-fadeIn">
                <div className="p-3 rounded-3" style={{ backgroundColor: "rgba(79, 70, 229, 0.05)", border: "1px dashed var(--primary)" }}>
                  <div className="d-flex align-items-center mb-2 text-primary">
                    <i className="bi bi-cash-stack me-2"></i>
                    <span className="fw-bold small">Información Salarial</span>
                  </div>
                  <div className="row g-2">
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold text-muted">Monto</label>
                      <input 
                        type="number" 
                        name="monto_sueldo" 
                        value={form.monto_sueldo} 
                        onChange={handleChange}
                        className="form-control form-control-sm" 
                        placeholder="0.00" 
                        required 
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold text-muted">Tipo de sueldo</label>
                      <select 
                        name="tipo_sueldo" 
                        value={form.tipo_sueldo} 
                        onChange={handleChange} 
                        className="form-select form-select-sm"
                      >
                        <option value="mensual">Mensual</option>
                        <option value="por_hora">Por hora</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="d-flex gap-2 mt-4">
            <button type="button" className="btn btn-light fw-semibold px-4" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary flex-fill" disabled={loading || success}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2"></span>{isEdit ? "Guardando..." : "Creando..."}</>
                : success
                  ? <><i className="bi bi-check-lg me-2"></i>{isEdit ? "Guardado" : "Creado"}</>
                  : isEdit
                    ? <><i className="bi bi-check-lg me-2"></i>Guardar cambios</>
                    : <><i className="bi bi-person-plus-fill me-2"></i>Crear usuario</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsuarioForm;
