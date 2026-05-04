/**
 * modules/dashboard.js — Dashboard global INC09 Suite
 */
const Modules = window.Modules || {};

Modules.dashboard = {
  render() {
    const exps  = DB.expedientes.getAll();
    const viats = DB.viaticos.getAll();
    const negs  = DB.visitas_neg.getAll();
    const pos   = DB.visitas_pos.getAll();
    const rest  = DB.visitas_rest.getAll();
    const c03   = DB.visitas_c03.getAll();
    const totalVisitas = negs.length + pos.length + rest.length + c03.length;

    document.getElementById('stat-expedientes').textContent = exps.length;
    document.getElementById('stat-visitas').textContent     = totalVisitas;
    document.getElementById('stat-viaticos').textContent    = viats.length;

    const totalImp = exps.reduce((s, e) => s + (parseFloat(e.importe) || 0), 0);
    document.getElementById('stat-importe').textContent = Utils.formatCurrencyShort(totalImp);

    this.renderRecientes(exps);
  },

  renderRecientes(exps) {
    const tbody = document.getElementById('dash-recientes-body');
    if (!tbody) return;
    const recientes = [...exps].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 8);
    tbody.innerHTML = recientes.map(e => `
      <tr>
        <td>${Utils.esc(e.registro_patronal)}</td>
        <td>${Utils.esc(e.razon_social)}</td>
        <td><span class="badge badge-blue">${Utils.esc(e.rango || '—')}</span></td>
        <td>${Utils.formatCurrencyShort(e.importe)}</td>
        <td>${Utils.formatDate(e.created_at)}</td>
        <td><button class="btn btn-sm btn-ghost" onclick="Modules.expedientes.openControl(${e.id})">Ver</button></td>
      </tr>`).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">Sin registros</td></tr>';
  }
};
