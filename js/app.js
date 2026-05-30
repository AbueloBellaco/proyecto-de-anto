/* ═══════════════════════════════════════════════
   ADHERENCIA 360 — app.js  (versión corregida)
   ═══════════════════════════════════════════════ */

/* ── PROTECCIÓN DE SESIÓN (páginas del médico) ── */
(function guardSession() {
  const pagina = location.pathname.split('/').pop() || 'index.html';
  const paginasMedico = ['index.html', 'pacientes.html', 'medicamentos.html', 'contacto.html', ''];
  if (!paginasMedico.includes(pagina)) return;
  const sesion = JSON.parse(sessionStorage.getItem('sesion360') || 'null');
  if (!sesion || sesion.rol !== 'medico') {
    window.location.href = 'login.html';
  }
})();

/* ── LOGOUT MÉDICO ── */
function cerrarSesion() {
  sessionStorage.removeItem('sesion360');
  window.location.href = 'login.html';
}
window.cerrarSesion = cerrarSesion;
function cerrarSesionMedico() { cerrarSesion(); }
window.cerrarSesionMedico = cerrarSesionMedico;

/* ── BASE DE DATOS LOCAL ── */
function initDB() {
  if (!localStorage.getItem('pacientes360')) {
    localStorage.setItem('pacientes360', JSON.stringify([
      { id: 1, nombre: "María García López",    enfermedad: "Diabetes T2",    celular: "987654321", adherencia: 92 },
      { id: 2, nombre: "Carlos Mendoza Ríos",   enfermedad: "Hipertensión",   celular: "912345678", adherencia: 41 },
      { id: 3, nombre: "Ana Torres Vega",       enfermedad: "Asma",           celular: "945612378", adherencia: 88 },
      { id: 4, nombre: "Luis Paredes Flores",   enfermedad: "Diabetes T2",    celular: "934567890", adherencia: 63 },
      { id: 5, nombre: "Rosa Huanca Quispe",    enfermedad: "Hipertensión",   celular: "923456789", adherencia: 95 },
      { id: 6, nombre: "Jorge Vargas Castillo", enfermedad: "Cardiopatía",    celular: "956789012", adherencia: 35 },
      { id: 7, nombre: "Elena Suárez Mora",     enfermedad: "Diabetes T2",    celular: "967890123", adherencia: 79 },
      { id: 8, nombre: "Pedro Chávez Reyes",    enfermedad: "EPOC",           celular: "978901234", adherencia: 57 },
      { id: 9, nombre: "Carmen Lozano Pinto",   enfermedad: "Hipotiroidismo", celular: "989012345", adherencia: 97 },
      { id:10, nombre: "Andrés Mamani Condori", enfermedad: "Hipertensión",   celular: "990123456", adherencia: 28 },
      { id:11, nombre: "Patricia Silva Rojas",  enfermedad: "Artritis reum.", celular: "901234567", adherencia: 84 },
      { id:12, nombre: "Miguel Quispe Apaza",   enfermedad: "Diabetes T2",    celular: "912340987", adherencia: 68 }
    ]));
  }
  if (!localStorage.getItem('tratamientos360')) {
    localStorage.setItem('tratamientos360', JSON.stringify([
      { id: 1, pacienteId: 1, nombrePaciente: "María García López",  med: "Metformina 500mg", dosis: "1 pastilla", horario: "08:00 AM, 08:00 PM" },
      { id: 2, pacienteId: 2, nombrePaciente: "Carlos Mendoza Ríos", med: "Losartán 50mg",    dosis: "1 pastilla", horario: "09:00 AM" },
      { id: 3, pacienteId: 3, nombrePaciente: "Ana Torres Vega",     med: "Salbutamol",        dosis: "2 puffs",   horario: "07:00 AM, 01:00 PM, 07:00 PM" }
    ]));
  }
}
initDB();

const getPacientes     = () => JSON.parse(localStorage.getItem('pacientes360'))     || [];
const getTratamientos  = () => JSON.parse(localStorage.getItem('tratamientos360'))  || [];
const savePacientes    = (d) => localStorage.setItem('pacientes360',    JSON.stringify(d));
const saveTratamientos = (d) => localStorage.setItem('tratamientos360', JSON.stringify(d));

/* ── MODO OSCURO ── */
(function initDarkMode() {
  const body       = document.body;
  const darkToggle = document.getElementById('darkToggle');
  if (!darkToggle) return;

  const applyDark = (isDark) => {
    body.classList.toggle('dark', isDark);
    const icon = darkToggle.querySelector('i');
    if (icon) icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    const label = darkToggle.querySelector('.dark-label');
    if (label) label.textContent = isDark ? 'Modo Claro' : 'Modo Oscuro';
  };

  applyDark(localStorage.getItem('darkMode') === 'true');
  darkToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark);
    applyDark(isDark);
  });
})();

/* ── TOAST ── */
let _toastTimer = null;
function mostrarToast(mensaje, tipo = 'success') {
  const toast   = document.getElementById('toast');
  const msgEl   = document.getElementById('toastMsg');
  if (!toast || !msgEl) return;

  msgEl.textContent = mensaje;

  // color según tipo
  const colores = { success: '#10b981', error: '#ef4444', info: '#3b82f6', warning: '#f59e0b' };
  toast.style.background = colores[tipo] || colores.success;

  toast.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}
window.mostrarToast = mostrarToast;

/* ── MODALES ── */
function abrirModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function cerrarModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('active'); document.body.style.overflow = ''; }
}
window.abrirModal  = abrirModal;
window.cerrarModal = cerrarModal;

// Cerrar modal al hacer clic fuera
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('active')) {
    cerrarModal(e.target.id);
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => cerrarModal(m.id));
  }
});

/* ── FILTRAR TABLA ── */
function filtrarTabla(inputId, tableId) {
  const q    = (document.getElementById(inputId)?.value || '').toLowerCase().trim();
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!tbody) return;
  tbody.querySelectorAll('tr').forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(q) ? '' : 'none';
  });
}
window.filtrarTabla = filtrarTabla;

/* ═══════════════════════════
   PÁGINA: DASHBOARD (index.html)
   ═══════════════════════════ */
(function initDashboard() {
  const statTotal   = document.getElementById('statTotalPacientes');
  const statAdh     = document.getElementById('statAdherencia');
  const statRiesgo  = document.getElementById('statRiesgo');
  if (!statTotal) return; // no estamos en el dashboard

  const pacs = getPacientes();
  statTotal.textContent = pacs.length;

  const media = pacs.length
    ? Math.round(pacs.reduce((a, p) => a + p.adherencia, 0) / pacs.length)
    : 0;
  statAdh.textContent = media + '%';

  const enRiesgo = pacs.filter(p => p.adherencia < 60).length;
  statRiesgo.textContent = enRiesgo;

  // Mensajes de WhatsApp: suma de tratamientos * factor
  const trats = getTratamientos();
  const msgEl = document.getElementById('statMensajes');
  if (msgEl) msgEl.textContent = '+' + (trats.length * 4 + 108);

  // Render alertas dinámicas
  renderAlertas(pacs);
})();

function renderAlertas(pacs) {
  const tbody = document.getElementById('alertasBody');
  if (!tbody) return;

  const enRiesgo = pacs
    .filter(p => p.adherencia < 60)
    .sort((a, b) => a.adherencia - b.adherencia);

  if (enRiesgo.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--text-sub)">
      <i class="fa-solid fa-circle-check" style="color:var(--green);margin-right:8px"></i>Sin alertas activas</td></tr>`;
    return;
  }

  tbody.innerHTML = enRiesgo.map(p => {
    const badgeCls = p.adherencia < 40 ? 'badge-red' : 'badge-amber';
    const tipoAlerta = p.adherencia < 40 ? 'Dosis omitida' : 'Sin confirmar';
    const trats = getTratamientos().filter(t => t.pacienteId === p.id);
    const medNombre = trats.length ? trats[0].med : 'Medicamento';
    const haceHoras = Math.floor(Math.random() * 5) + 1;

    return `<tr>
      <td><strong>${p.nombre}</strong></td>
      <td><span class="badge ${badgeCls}">${tipoAlerta} (${medNombre})</span></td>
      <td>Hace ${haceHoras} hora${haceHoras > 1 ? 's' : ''}</td>
      <td>
        <button class="btn btn-sm btn-outline"
          onclick="accionAlerta(this, '${p.nombre}', 'whatsapp')">
          <i class="fa-brands fa-whatsapp"></i> Recordar
        </button>
        <button class="btn btn-sm btn-outline" style="margin-left:6px"
          onclick="accionAlerta(this, '${p.nombre}', 'llamar')">
          <i class="fa-solid fa-phone"></i> Llamar
        </button>
      </td>
    </tr>`;
  }).join('');
}

function accionAlerta(btn, nombre, tipo) {
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-check"></i> Enviado';
  btn.style.opacity = '0.6';
  const msg = tipo === 'whatsapp'
    ? `Recordatorio enviado a ${nombre} por WhatsApp`
    : `Llamada programada con ${nombre}`;
  mostrarToast(msg);
}
window.accionAlerta = accionAlerta;

/* ═══════════════════════════
   PÁGINA: PACIENTES (pacientes.html)
   ═══════════════════════════ */
(function initPacientes() {
  const tbody = document.getElementById('listaPacientesBody');
  if (!tbody) return;

  function renderPacientes() {
    const pacs = getPacientes();
    const counter = document.getElementById('contadorPacientes');
    if (counter) counter.textContent = pacs.length + ' pacientes';
    if (pacs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-sub)">
        Sin pacientes registrados. Agrega el primero.</td></tr>`;
      return;
    }
    tbody.innerHTML = pacs.map(p => {
      let estadoBadge, estadoTexto;
      if (p.adherencia >= 80)      { estadoBadge = 'badge-green';  estadoTexto = 'Activo'; }
      else if (p.adherencia >= 60) { estadoBadge = 'badge-amber';  estadoTexto = 'Irregular'; }
      else                          { estadoBadge = 'badge-red';    estadoTexto = 'En Riesgo'; }

      const color = p.adherencia >= 80 ? '#10b981' : p.adherencia >= 60 ? '#f59e0b' : '#ef4444';

      return `<tr>
        <td><strong>${p.nombre}</strong></td>
        <td>${p.enfermedad}</td>
        <td><i class="fa-brands fa-whatsapp" style="color:#25D366;margin-right:4px"></i>${p.celular}</td>
        <td><span class="badge ${estadoBadge}">${estadoTexto}</span></td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="flex:1;height:6px;background:var(--border);border-radius:6px;overflow:hidden">
              <div style="width:${p.adherencia}%;height:100%;background:${color};border-radius:6px"></div>
            </div>
            <strong style="font-size:.85rem;min-width:36px">${p.adherencia}%</strong>
          </div>
        </td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="eliminarPaciente(${p.id})" title="Eliminar">
            <i class="fa-solid fa-trash" style="color:var(--red)"></i>
          </button>
        </td>
      </tr>`;
    }).join('');
  }
  renderPacientes();
  window._renderPacientes = renderPacientes; // expose for form submit

  // Actualizar columnas de la tabla para incluir "Acciones"
  const thead = document.querySelector('#tablaPacientes thead tr');
  if (thead && thead.children.length === 5) {
    const th = document.createElement('th');
    th.textContent = 'Acciones';
    thead.appendChild(th);
  }

  // Guardar nuevo paciente
  const form = document.getElementById('formPaciente');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre     = document.getElementById('pacNombre').value.trim();
      const enfermedad = document.getElementById('pacEnfermedad').value;
      const celular    = document.getElementById('pacCelular').value.trim();

      if (!nombre || !enfermedad || !celular) {
        mostrarToast('Completa todos los campos', 'error');
        return;
      }

      const pacs = getPacientes();
      pacs.push({ id: Date.now(), nombre, enfermedad, celular, adherencia: 100 });
      savePacientes(pacs);

      renderPacientes();
      cerrarModal('modalPaciente');
      form.reset();
      mostrarToast(`Paciente "${nombre}" registrado exitosamente`);
    });
  }
})();

function eliminarPaciente(id) {
  if (!confirm('¿Eliminar este paciente?')) return;
  const pacs = getPacientes().filter(p => p.id !== id);
  savePacientes(pacs);
  if (window._renderPacientes) window._renderPacientes();
  mostrarToast('Paciente eliminado', 'info');
}
window.eliminarPaciente = eliminarPaciente;

/* ═══════════════════════════
   PÁGINA: TRATAMIENTOS (medicamentos.html)
   ═══════════════════════════ */
(function initTratamientos() {
  const tbody = document.getElementById('listaTratamientosBody');
  if (!tbody) return;

  function renderTratamientos() {
    const trats = getTratamientos();
    if (trats.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-sub)">
        Sin tratamientos asignados.</td></tr>`;
      return;
    }
    tbody.innerHTML = trats.map(t => `
      <tr>
        <td><strong>${t.nombrePaciente}</strong></td>
        <td><span class="badge badge-amber"><i class="fa-solid fa-pills" style="margin-right:4px"></i>${t.med}</span></td>
        <td>${t.dosis}</td>
        <td>${t.horario}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="eliminarTratamiento(${t.id})" title="Eliminar">
            <i class="fa-solid fa-trash" style="color:var(--red)"></i>
          </button>
        </td>
      </tr>`).join('');
  }
  renderTratamientos();
  window._renderTratamientos = renderTratamientos;

  // Añadir columna Acciones si no existe
  const thead = document.querySelector('#tablaTratamientos thead tr');
  if (thead && thead.children.length === 4) {
    const th = document.createElement('th');
    th.textContent = 'Acciones';
    thead.appendChild(th);
  }

  // Guardar tratamiento
  const form = document.getElementById('formTratamiento');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const pacienteRaw = document.getElementById('tratPaciente').value;
      const med         = document.getElementById('tratMed').value.trim();
      const dosis       = document.getElementById('tratDosis').value.trim();
      const horario     = document.getElementById('tratHorario').value.trim();

      if (!pacienteRaw || !med || !dosis || !horario) {
        mostrarToast('Completa todos los campos', 'error');
        return;
      }

      const [pacienteId, nombrePaciente] = pacienteRaw.split('|');
      const trats = getTratamientos();
      trats.push({ id: Date.now(), pacienteId: parseInt(pacienteId), nombrePaciente, med, dosis, horario });
      saveTratamientos(trats);

      renderTratamientos();
      cerrarModal('modalTratamiento');
      form.reset();
      mostrarToast(`Tratamiento "${med}" asignado y programado`);
    });
  }
})();

function abrirModalTratamiento() {
  const select = document.getElementById('tratPaciente');
  if (select) {
    select.innerHTML = '<option value="">Seleccione un paciente...</option>';
    getPacientes().forEach(p => {
      select.innerHTML += `<option value="${p.id}|${p.nombre}">${p.nombre} (${p.enfermedad})</option>`;
    });
  }
  abrirModal('modalTratamiento');
}
window.abrirModalTratamiento = abrirModalTratamiento;

function eliminarTratamiento(id) {
  if (!confirm('¿Eliminar este tratamiento?')) return;
  const trats = getTratamientos().filter(t => t.id !== id);
  saveTratamientos(trats);
  if (window._renderTratamientos) window._renderTratamientos();
  mostrarToast('Tratamiento eliminado', 'info');
}
window.eliminarTratamiento = eliminarTratamiento;

/* ── ANIMACIONES FADE-IN (todas las páginas) ── */
(function initFadeIn() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
})();

/* ── NOTIFICACIONES ── */
function initNotificaciones() {
  const bell = document.querySelector('.notification-bell');
  if (!bell) return;

  const pacs = getPacientes();
  const alertas = pacs.filter(p => p.adherencia < 60);

  const panel = document.createElement('div');
  panel.id = 'notifPanel';
  panel.style.cssText = `
    position:fixed;top:70px;right:28px;width:320px;background:var(--surface);
    border:1px solid var(--border);border-radius:16px;box-shadow:var(--shadow-lg);
    z-index:500;display:none;overflow:hidden;
  `;

  const header = `<div style="padding:14px 18px;border-bottom:1px solid var(--border);background:var(--surface2);display:flex;justify-content:space-between;align-items:center">
    <strong style="font-size:.9rem;color:var(--text)"><i class="fa-solid fa-bell" style="color:var(--primary);margin-right:8px"></i>Notificaciones</strong>
    <span style="background:#fee2e2;color:#dc2626;border-radius:50px;padding:2px 9px;font-size:.72rem;font-weight:700">${alertas.length} alertas</span>
  </div>`;

  const items = alertas.length === 0
    ? `<div style="padding:24px;text-align:center;color:var(--text-sub);font-size:.85rem"><i class="fa-solid fa-circle-check" style="color:#10b981;display:block;font-size:2rem;margin-bottom:8px"></i>Sin alertas pendientes</div>`
    : alertas.map(p => `
      <div style="padding:12px 18px;border-bottom:1px solid var(--border);display:flex;gap:12px;align-items:center">
        <div style="width:38px;height:38px;border-radius:50%;background:#fee2e2;color:#dc2626;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:700;font-size:.85rem">
          ${p.nombre.split(' ').map(w=>w[0]).join('').substring(0,2)}
        </div>
        <div style="flex:1">
          <strong style="font-size:.85rem;color:var(--text);display:block">${p.nombre}</strong>
          <span style="font-size:.76rem;color:var(--text-sub)">Adherencia: <b style="color:#ef4444">${p.adherencia}%</b> — requiere atención</span>
        </div>
      </div>`).join('');

  const footer = `<div style="padding:12px 18px;text-align:center">
    <a href="pacientes.html" style="font-size:.82rem;color:var(--primary);font-weight:600;text-decoration:none">Ver todos los pacientes →</a>
  </div>`;

  panel.innerHTML = header + `<div style="max-height:280px;overflow-y:auto">${items}</div>` + footer;
  document.body.appendChild(panel);

  bell.style.cursor = 'pointer';
  bell.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  });
  document.addEventListener('click', () => { panel.style.display = 'none'; });

  // Badge con número
  const dot = bell.querySelector('.badge-dot');
  if (dot && alertas.length > 0) {
    dot.style.cssText = `position:absolute;top:-4px;right:-6px;background:#ef4444;color:#fff;
      border-radius:50px;font-size:.6rem;font-weight:700;padding:1px 5px;
      border:2px solid var(--surface);min-width:18px;text-align:center`;
    dot.textContent = alertas.length;
  }
}
document.addEventListener('DOMContentLoaded', initNotificaciones);