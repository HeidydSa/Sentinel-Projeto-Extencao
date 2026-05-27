function render() {
    const s = getState();
    document.getElementById('sb-avatar').textContent = s.usuario.iniciais;
    document.getElementById('sb-nome').textContent = s.usuario.nome;

    document.getElementById('kpi-ativos').textContent = projetosAtivos(s).length;
    document.getElementById('kpi-finalizados').textContent = tarefasFinalizadas(s).length;
    document.getElementById('kpi-economia').textContent = formatCurrency(economiaTotal(s));

    const wrap = document.getElementById('chart-wrap');
    const projComEcon = s.projetos.map(p => ({
        nome: p.nome,
        econ: economiaPorProjeto(s, p.id)
    })).filter(p => p.econ > 0);

    if (projComEcon.length === 0) {
        wrap.innerHTML = '<p style="color:rgba(255,255,255,.5);text-align:center;padding:2rem;">Nenhum dado disponível.</p>';
        return;
    }

    const maxVal = Math.max(...projComEcon.map(p => p.econ), 1);

    const descricao = projComEcon.map(p => `${p.nome}: ${formatCurrency(p.econ)}`).join('; ');
    wrap.setAttribute('aria-label', `Economia por projeto — ${descricao}`);

    wrap.innerHTML = `
    <div class="chart-bars" aria-hidden="true">
      ${projComEcon.map((p, i) => {
        const pct = Math.round((p.econ / maxVal) * 100);
        const cls = i % 3 === 1 ? 'bar--2' : i % 3 === 2 ? 'bar--3' : '';
        return `
          <div class="bar-group">
            <div class="bar-group-title">${esc(p.nome)}</div>
            <div class="bars" style="justify-content:center">
              <div class="bar ${cls}" style="--h:${pct}%;max-width:40px;flex:none;width:40px" title="${esc(p.nome)}: ${formatCurrency(p.econ)}">
                <span class="bar-val">${formatCurrencyShort(p.econ)}</span>
              </div>
            </div>
          </div>`;
    }).join('')}
    </div>
    <div class="chart-legend" aria-hidden="true">
      ${projComEcon.map((p, i) => {
        const cls = i % 3 === 1 ? 'legend-dot--2' : i % 3 === 2 ? 'legend-dot--3' : '';
        return `<span class="legend-item"><span class="legend-dot ${cls}"></span>${esc(p.nome)}</span>`;
    }).join('')}
    </div>`;
}

function formatCurrencyShort(v) {
    if (v >= 1000) return 'R$' + (v / 1000).toFixed(1) + 'k';
    return 'R$' + v;
}

function esc(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function setPeriodo(btn) {
    document.querySelectorAll('.periodo-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
}

function toggleMenu(btn) {
    const exp = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !exp);
    document.getElementById('sidebar').classList.toggle('sidebar--open');
}

render();
