import { enhancePasswordFields } from './password-fields.js';
import { BaseClient } from '../../client/base.client.js';
import { refreshSession } from '../../services/auth_service.js';
const api = new BaseClient({ path: '' });
let session;
const esc = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]
  );
const request = (path, method = 'GET', payload) =>
  api.request(path, { method, payload });
const readonly = () => session && (session.gestor || !session.equipe);
const writeActions =
  /(?:moveCard|openEdit|openCreateTask|openDeleteTask|openCreateModal|openDeleteModal|openEditModal|deleteComentario|saveComentario|onCreate|openCreate|openDelete|deleteProject|editProject|saveEdit|saveCreateTask)/;
function markReadonly() {
  if (!readonly()) return;
  document
    .querySelectorAll(
      '.app-main button,[draggable],.btn-edit,.btn-delete,.btn-move,.btn-delete-comentario'
    )
    .forEach((element) => {
      if (element.closest('.team-status')) return;
      const action = element.getAttribute('onclick') || '';
      if (element.matches('[draggable]') && element.draggable)
        element.draggable = false;
      if (
        (writeActions.test(action) ||
          element.matches(
            '.btn-edit,.btn-delete,.btn-move,.btn-delete-comentario'
          )) &&
        !element.disabled
      ) {
        element.disabled = true;
        element.title = session.gestor
          ? 'Gestor: somente consulta'
          : 'Entre em uma equipe primeiro';
      }
    });
}
document.addEventListener(
  'click',
  (event) => {
    if (
      !readonly() ||
      event.target.closest('.team-dialog,.team-status,.team-sidebar')
    )
      return;
    const button = event.target.closest('[onclick]');
    if (button && writeActions.test(button.getAttribute('onclick'))) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },
  true
);
document.addEventListener(
  'submit',
  (event) => {
    if (
      readonly() &&
      !event.target.closest('.team-dialog') &&
      !/perfil/i.test(event.target.id)
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },
  true
);
document.addEventListener(
  'dragstart',
  (event) => {
    if (readonly()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },
  true
);
const observer = new MutationObserver(markReadonly);
function enhanceTeamPicker(modal) {
  const select = modal.querySelector('select[name="equipeId"]');
  if (!select) return;
  select.hidden = true;
  select.tabIndex = -1;
  const picker = document.createElement('details');
  picker.className = 'stats-month-picker team-picker';
  const summary = document.createElement('summary');
  summary.setAttribute('aria-label', 'Selecionar equipe');
  const value = document.createElement('strong');
  value.textContent =
    select.selectedOptions[0]?.textContent || 'Selecione uma equipe';
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '▾';
  summary.append(value, arrow);
  const options = document.createElement('div');
  options.className = 'stats-month-options';
  options.setAttribute('role', 'group');
  options.setAttribute('aria-label', 'Equipes disponiveis');
  for (const option of select.options) {
    if (!option.value) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'stats-month-option';
    button.textContent = option.textContent;
    button.setAttribute('aria-pressed', String(option.selected));
    button.onclick = () => {
      select.value = option.value;
      value.textContent = option.textContent;
      options
        .querySelectorAll('button')
        .forEach((item) =>
          item.setAttribute('aria-pressed', String(item === button))
        );
      select.dispatchEvent(new Event('change', { bubbles: true }));
      picker.open = false;
      summary.focus();
    };
    options.append(button);
  }
  if (!options.childElementCount) {
    const empty = document.createElement('p');
    empty.className = 'stats-month-empty';
    empty.textContent = 'Nenhuma equipe disponivel.';
    options.append(empty);
  }
  picker.append(summary, options);
  select.closest('label').after(picker);
  select.addEventListener('invalid', (event) => {
    event.preventDefault();
    picker.open = true;
    summary.focus();
    modal.querySelector('[role=alert]').textContent =
      'Selecione uma equipe para continuar.';
  });
  picker.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      picker.open = false;
      summary.focus();
    }
  });
  modal.addEventListener('click', (event) => {
    if (!picker.contains(event.target)) picker.open = false;
  });
}

function dialog(title, body) {
  document.querySelector('.team-dialog')?.close();
  document.querySelector('.team-dialog')?.remove();
  const modal = document.createElement('dialog');
  modal.className = 'team-dialog';
  modal.setAttribute('aria-labelledby', 'team-dialog-title');
  modal.innerHTML =
    '<h2 id="team-dialog-title">' +
    esc(title) +
    '</h2>' +
    body +
    '<p class="team-error" role="alert"></p><button type="button" class="btn" data-close>Fechar</button>';
  enhanceTeamPicker(modal);
  enhancePasswordFields(modal);
  document.body.append(modal);
  modal.querySelector('[data-close]').onclick = () => modal.close();
  modal.addEventListener('close', () => modal.remove(), { once: true });
  modal.showModal();
  return modal;
}
function bind(modal, selector, action) {
  modal.querySelector(selector)?.addEventListener('click', async (event) => {
    event.preventDefault();
    const button = event.currentTarget;
    button.disabled = true;
    try {
      await action();
    } catch (error) {
      modal.querySelector('[role=alert]').textContent = error.message;
      modal
        .querySelector('input[type=password]')
        ?.classList.add('team-password-invalid');
    } finally {
      if (button.isConnected) button.disabled = false;
    }
  });
}
async function mutate(path, method, payload) {
  await request(path, method, payload);
  location.reload();
}
function createForm() {
  const modal = dialog(
    'Criar equipe',
    '<form class="team-create-form"><label>Nome da equipe<input name="nome" required maxlength="150"></label><label>Senha da equipe<input type="password" name="senha" required minlength="8" maxlength="72" autocomplete="new-password"></label><label>Confirmar senha da equipe<input type="password" name="confirmacao" required autocomplete="new-password"></label><button class="btn btn-primary-alt" type="submit">Criar equipe</button></form>'
  );
  modal.querySelector('form').onsubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget,
      button = form.querySelector('button');
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    if (data.senha !== data.confirmacao) {
      modal.querySelector('[role=alert]').textContent =
        'As senhas não coincidem.';
      return;
    }
    button.disabled = true;
    try {
      await mutate('/equipes', 'POST', { nome: data.nome, senha: data.senha });
    } catch (error) {
      modal.querySelector('[role=alert]').textContent = error.message;
      button.disabled = false;
    }
  };
}
const teamIcon = (name) => {
  const paths = {
    people:
      '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v2"/>',
    plus: '<path d="M12 4v16M4 12h16"/>',
    swap: '<path d="M4 7h16l-4-4M20 17H4l4 4M20 7l-4 4M4 17l4-4"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
    crown: '<path d="M3 6l5 4 4-7 4 7 5-4-2 14H5z"/>',
    settings:
      '<path d="m9.7 4.3.5-2.3h3.6l.5 2.3 2 .9 2.1-.7 1.8 3.1-1.6 1.6.2 2.2 1.7 1.5-1.8 3.1-2.2-.6-1.8 1.3-.5 2.3h-3.6l-.5-2.3-2-.9-2.1.7-1.8-3.1 1.6-1.6-.2-2.2-1.7-1.5 1.8-3.1 2.2.6z"/><circle cx="12" cy="11" r="3"/>',
    key: '<path d="M21 7a5 5 0 0 1-7.5 4.3L5 20H2v-3l2-2h3v-3l2.7-2.5A5 5 0 1 1 21 7Z"/><circle cx="17" cy="6" r="1"/>',
    exit: '<path d="M14 4H4v16h10M10 12h12l-4-4M22 12l-4 4"/>',
  };
  return (
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    paths[name] +
    '</svg>'
  );
};

async function openTeam() {
  try {
    session = await refreshSession();
    let selectedTeam = session.equipe;
    if (session.gestor && sessionStorage.getItem('equipe_consulta')) {
      const teams = await request('/equipes');
      selectedTeam = teams.find(
        (team) => String(team.id) === sessionStorage.getItem('equipe_consulta')
      );
    }
    if (!selectedTeam) return openEntry();
    const team = selectedTeam,
      leader = Number(team.idLider) === Number(session.id) && !session.gestor;
    const members = await request('/equipes/' + team.id + '/membros');
    const modal = dialog(
      team.nome,
      '<p>Integrantes e funções</p><ul>' +
        members
          .map(
            (member) =>
              '<li><label>' +
              (leader && Number(member.id) !== Number(session.id)
                ? '<input type="checkbox" name="member" value="' +
                  member.id +
                  '">'
                : '') +
              esc(member.nome + ' ' + member.sobrenome) +
              ' · ' +
              esc(member.tipo) +
              (Number(member.id) === Number(team.idLider) ? ' · Líder' : '') +
              '</label></li>'
          )
          .join('') +
        '</ul>' +
        (leader
          ? '<button class="btn" data-add>Adicionar membro</button><button class="btn team-danger" data-remove disabled>Remover da equipe</button><button class="btn" data-transfer>Transferir liderança</button><button class="btn" data-password>Alterar senha da equipe</button>'
          : '') +
        (!session.gestor
          ? '<button class="btn team-danger" data-leave>Deixar equipe</button>'
          : '')
    );
    {
      modal.classList.add('team-leader-dialog');
      const add = modal.querySelector('[data-add]');
      if (add) add.innerHTML = teamIcon('plus') + 'Adicionar membro';
      const title = modal.querySelector('h2');
      const header = document.createElement('header');
      header.className = 'team-modal-header';
      title.before(header);
      const heading = document.createElement('div');
      heading.className = 'team-modal-title';
      heading.innerHTML =
        '<span class="team-section-icon">' + teamIcon('people') + '</span>';
      heading.append(title);
      header.append(heading);
      if (add) header.append(add);
      modal.querySelector('h2 + p')?.remove();
      const list = modal.querySelector('ul');
      list.previousElementSibling?.matches('p') &&
        list.previousElementSibling.remove();
      const section = document.createElement('section');
      section.className = 'team-members-section';
      section.innerHTML =
        '<h3><span class="team-section-icon">' +
        teamIcon('people') +
        '</span>' +
        (leader ? 'Integrantes' : 'Integrantes e fun\u00e7\u00f5es') +
        '</h3>' +
        (leader
          ? '<p class="team-selection-help">Gerencie os integrantes usando os bot\u00f5es ao lado de cada pessoa.</p>'
          : '');
      list.before(section);
      list.className = 'team-member-list';
      list.innerHTML = members
        .map((member) => {
          const isLeader = Number(member.id) === Number(team.idLider);
          const name = member.nome + ' ' + member.sobrenome;
          const initials = (member.nome[0] || '') + (member.sobrenome[0] || '');
          return (
            '<li class="team-member-card' +
            (isLeader ? ' is-leader' : '') +
            '">' +
            '<span class="team-avatar" aria-hidden="true">' +
            esc(initials.toUpperCase()) +
            '</span><div class="team-member-info"><strong>' +
            esc(name) +
            '</strong><div class="team-member-badges"><span>' +
            esc(member.tipo) +
            '</span>' +
            (isLeader
              ? '<span class="team-leader-badge">' +
                teamIcon('crown') +
                'L\u00edder</span>'
              : '') +
            '</div></div>' +
            (leader && !isLeader
              ? '<div class="team-member-actions"><button type="button" class="btn" data-row-transfer="' +
                member.id +
                '">' +
                teamIcon('swap') +
                'Transferir lideran\u00e7a</button><button type="button" class="btn team-remove-outline" data-row-remove="' +
                member.id +
                '">' +
                teamIcon('trash') +
                'Remover</button></div>'
              : '') +
            '</li>'
          );
        })
        .join('');
      section.append(list);
      modal.querySelector('[data-transfer]')?.remove();
      modal.querySelector('[data-remove]')?.remove();
      if (leader) {
        const settings = document.createElement('section');
        settings.className = 'team-settings-section';
        settings.innerHTML =
          '<h3><span class="team-section-icon">' +
          teamIcon('settings') +
          '</span>Configura\u00e7\u00f5es da equipe</h3><p>Atualize a senha usada para entrar na equipe.</p>';
        section.after(settings);
        const passwordButton = modal.querySelector('[data-password]');
        passwordButton.innerHTML = teamIcon('key') + 'Alterar senha da equipe';
        settings.append(passwordButton);
      }
      const footer = document.createElement('div');
      footer.className = 'team-leader-footer';
      const close = modal.querySelector('[data-close]');
      close.before(footer);
      const leave = modal.querySelector('[data-leave]');
      footer.append(close);
      if (leave) {
        leave.innerHTML = teamIcon('exit') + 'Deixar equipe';
        footer.append(leave);
      }
    }
    bind(modal, '[data-add]', () => addMembers(team));
    for (const button of modal.querySelectorAll('[data-row-transfer]')) {
      bind(
        modal,
        '[data-row-transfer="' + button.dataset.rowTransfer + '"]',
        async () => {
          if (confirm('Transferir a lideran\u00e7a para este integrante?'))
            await mutate('/equipes/' + team.id + '/lider', 'POST', {
              usuarioId: Number(button.dataset.rowTransfer),
            });
        }
      );
    }
    for (const button of modal.querySelectorAll('[data-row-remove]')) {
      bind(
        modal,
        '[data-row-remove="' + button.dataset.rowRemove + '"]',
        async () => {
          if (
            !confirm(
              'Remover este integrante da equipe? A conta ser\u00e1 preservada.'
            )
          )
            return;
          await mutate(
            '/equipes/' + team.id + '/membros/' + button.dataset.rowRemove,
            'DELETE'
          );
        }
      );
    }
    bind(modal, '[data-password]', () => {
      const change = dialog(
        'Alterar senha da equipe',
        '<form><label>Nova senha da equipe<input type="password" name="senha" minlength="8" maxlength="72" required autocomplete="new-password"></label><label>Confirmar senha<input type="password" name="confirmacao" required autocomplete="new-password"></label><button type="submit" class="btn btn-primary-alt">Salvar senha</button></form>'
      );
      change.querySelector('form').onsubmit = async (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget));
        if (data.senha !== data.confirmacao) {
          change.querySelector('[role=alert]').textContent =
            'As senhas não coincidem.';
          return;
        }
        const button = event.currentTarget.querySelector('button');
        button.disabled = true;
        try {
          await mutate('/equipes/' + team.id, 'PUT', { senha: data.senha });
        } catch (error) {
          change.querySelector('[role=alert]').textContent = error.message;
          button.disabled = false;
        }
      };
    });
    bind(modal, '[data-leave]', async () => {
      if (leader && members.length > 1)
        throw new Error('Transfira a liderança antes de deixar a equipe.');
      const last = members.length === 1;
      if (
        !confirm(
          last
            ? 'Você é o último integrante. TODOS os projetos, tarefas, comentários e demais dados desta equipe serão perdidos permanentemente. Deseja excluir a equipe e sair?'
            : 'Deseja deixar esta equipe?'
        )
      )
        return;
      await mutate('/equipes/' + team.id + '/sair', 'POST', {
        confirmarExclusao: last,
      });
    });
  } catch (error) {
    dialog('Equipe', '<p>' + esc(error.message) + '</p>');
  }
}
async function addMembers(team) {
  const users = await request('/usuarios-sem-equipe');
  const modal = dialog(
    'Adicionar membro',
    '<p>Selecione usuários sem equipe. Eles receberão um convite e precisarão aceitar.</p><ul>' +
      users
        .map(
          (user) =>
            '<li><label><input type="checkbox" name="invite" value="' +
            user.id +
            '">' +
            esc(user.nome + ' ' + user.sobrenome) +
            ' · ' +
            esc(user.tipo) +
            '</label></li>'
        )
        .join('') +
      (users.length ? '' : '<li>Nenhum usuário disponível.</li>') +
      '<button class="btn btn-primary-alt" data-invite>Enviar convites</button>'
  );
  bind(modal, '[data-invite]', async () => {
    const ids = [...modal.querySelectorAll('input:checked')].map(
      (el) => el.value
    );
    if (!ids.length) throw new Error('Selecione pelo menos um usuário.');
    for (const id of ids)
      await request('/equipes/' + team.id + '/membros/' + id, 'POST');
    modal.close();
    await openTeam();
  });
}
async function openEntry() {
  const teams = await request('/equipes-publicas');
  const invites = await request('/convites');
  const modal = dialog(
    session.gestor ? 'Equipes · consulta' : 'Entrar em uma equipe',
    session.gestor
      ? '<p>Use o filtro de equipe na página para consultar os dados.</p>'
      : '<p>Aguardando equipe, você precisa estar dentro de uma equipe para utilizar a plataforma, pode também criar uma equipe.</p>' +
          '<form class="team-entry-form"><label>Equipe<select name="equipeId" required><option value="">Selecione uma equipe</option>' +
          teams
            .map(
              (team) =>
                '<option value="' +
                team.id +
                '">' +
                esc(team.nome) +
                ' · #' +
                team.id +
                '</option>'
            )
            .join('') +
          '</select></label><label>Senha da equipe<input type="password" name="senha" required autocomplete="current-password"></label><button type="submit" class="btn btn-primary-alt">Entrar na equipe</button></form>' +
          '<p class="team-help">Ainda não tem uma equipe? Crie a sua.</p><button class="btn btn-primary-alt" data-create>Criar equipe</button>' +
          (invites.length
            ? '<h3>Convites recebidos</h3>' +
              invites
                .map(
                  (invite) =>
                    '<p>' +
                    esc(invite.nome) +
                    ' <button class="btn" data-accept="' +
                    invite.id +
                    '">Aceitar</button><button class="btn" data-reject="' +
                    invite.id +
                    '">Recusar</button></p>'
                )
                .join('')
            : '')
  );
  modal.querySelector('[data-create]')?.addEventListener('click', createForm);
  const form = modal.querySelector('form');
  if (form)
    form.onsubmit = async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form)),
        button = form.querySelector('button');
      button.disabled = true;
      try {
        await mutate('/equipes/' + data.equipeId + '/entrar', 'POST', {
          senha: data.senha,
        });
      } catch (error) {
        modal.querySelector('[role=alert]').textContent = error.message;
        form.elements.senha.classList.add('team-password-invalid');
        button.disabled = false;
      }
    };
  modal
    .querySelectorAll('[data-accept]')
    .forEach((button) =>
      bind(modal, '[data-accept="' + button.dataset.accept + '"]', () =>
        mutate('/convites/' + button.dataset.accept + '/aceitar', 'POST')
      )
    );
  modal
    .querySelectorAll('[data-reject]')
    .forEach((button) =>
      bind(modal, '[data-reject="' + button.dataset.reject + '"]', () =>
        mutate('/convites/' + button.dataset.reject, 'DELETE')
      )
    );
}
async function init() {
  if (!localStorage.getItem('auth_token')) return;
  try {
    session = await refreshSession();
    const footer = document.querySelector('.sidebar-footer');
    if (!footer) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-primary-alt team-sidebar';
    button.textContent = 'Equipe';
    button.onclick = openTeam;
    const controls = document.createElement('div');
    controls.className = 'team-sidebar-actions';
    footer.before(controls);
    controls.append(button);

    const main = document.querySelector('.app-main'),
      panel = document.createElement('section');
    panel.className = 'team-status';
    if (session.gestor) {
      panel.innerHTML =
        '<label>Equipe para consulta <select aria-label="Equipe para consulta"><option value="">Todas as equipes</option></select></label><p>Perfil gestor: somente consulta.</p>';
      const teams = await request('/equipes-publicas'),
        select = panel.querySelector('select');
      for (const team of teams)
        select.add(new Option(team.nome + ' · #' + team.id, String(team.id)));
      select.value = sessionStorage.getItem('equipe_consulta') || '';
      if (!select.value) sessionStorage.removeItem('equipe_consulta');
      select.onchange = () => {
        sessionStorage.setItem('equipe_consulta', select.value);
        location.reload();
      };
    } else {
      const message = document.createElement('p');
      message.className = 'team-status-message';
      message.textContent = session.equipe
        ? 'Equipe: ' + session.equipe.nome
        : 'Você está sem equipe. Entre ou crie uma equipe para acessar projetos e tarefas.';
      panel.append(message);
      if (!session.equipe) {
        document.body.classList.add('team-no-work');
        const enter = document.createElement('button');
        enter.className = 'btn btn-primary';
        enter.textContent = 'Escolher ou criar equipe';
        enter.onclick = openTeam;
        panel.append(enter);
      }
    }
    const header = main?.querySelector('.app-header');
    if (session.gestor || !session.equipe) {
      if (header) header.after(panel);
      else main?.prepend(panel);
    }
    observer.observe(document.body, { childList: true, subtree: true });
    markReadonly();
  } catch (error) {
    console.error('Equipe:', error);
  }
}
init();
