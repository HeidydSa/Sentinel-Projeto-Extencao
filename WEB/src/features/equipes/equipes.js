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
    const selected = () =>
      [...modal.querySelectorAll('input[name=member]:checked')].map(
        (el) => el.value
      );
    modal
      .querySelectorAll('input[name=member]')
      .forEach(
        (el) =>
          (el.onchange = () =>
            (modal.querySelector('[data-remove]').disabled =
              !selected().length))
      );
    bind(modal, '[data-add]', () => addMembers(team));
    bind(modal, '[data-remove]', async () => {
      if (
        !confirm(
          'Remover os integrantes selecionados desta equipe? As contas serão preservadas.'
        )
      )
        return;
      for (const id of selected())
        await request('/equipes/' + team.id + '/membros/' + id, 'DELETE');
      location.reload();
    });
    bind(modal, '[data-transfer]', async () => {
      if (selected().length !== 1)
        throw new Error('Selecione um integrante para receber a liderança.');
      if (confirm('Transferir a liderança para o integrante selecionado?'))
        await mutate('/equipes/' + team.id + '/lider', 'POST', {
          usuarioId: Number(selected()[0]),
        });
    });
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
      : '<p>Aguardando equipe, você pode editar seu perfil, criar uma equipe ou entrar em uma existente.</p>' +
          '<form><label>Equipe<select name="equipeId" required><option value="">Selecione uma equipe</option>' +
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
          '<p class="team-help">Ainda não tem uma equipe? Crie a sua.</p><button class="btn" data-create>Criar equipe</button>' +
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
    button.className = 'btn-user team-sidebar';
    button.textContent =
      'Equipe · ' +
      (session.equipe?.nome ||
        (session.gestor ? 'Todas as equipes' : 'Aguardando equipe'));
    button.onclick = openTeam;
    const controls = document.createElement('div');
    controls.className = 'team-sidebar-actions';
    footer.before(controls);
    controls.append(button);
    if (!session.equipe && !session.gestor) {
      const create = document.createElement('button');
      create.type = 'button';
      create.className = 'btn-user team-sidebar';
      create.textContent = 'Criar equipe';
      create.onclick = createForm;
      button.after(create);
    }
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
      panel.textContent = session.equipe
        ? 'Equipe: ' + session.equipe.nome
        : 'Você está sem equipe. Entre ou crie uma equipe para acessar projetos e tarefas.';
      if (!session.equipe) {
        document.body.classList.add('team-no-work');
        const enter = document.createElement('button');
        enter.className = 'btn';
        enter.textContent = 'Escolher ou criar equipe';
        enter.onclick = openTeam;
        panel.append(enter);
      }
    }
    const header = main?.querySelector('.app-header');
    if (header) header.after(panel);
    else main?.prepend(panel);
    observer.observe(document.body, { childList: true, subtree: true });
    markReadonly();
  } catch (error) {
    console.error('Equipe:', error);
  }
}
init();
