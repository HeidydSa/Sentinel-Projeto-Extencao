export function enhancePasswordFields(root) {
  root.querySelectorAll('input[type=password]').forEach((input) => {
    if (input.parentElement.classList.contains('input-wrapper')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'input-wrapper';
    input.replaceWith(wrapper);
    wrapper.append(input);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'toggle-pw';
    button.textContent = '◉';
    button.setAttribute('aria-label', 'Mostrar senha da equipe');
    button.setAttribute('aria-pressed', 'false');
    button.onclick = () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      button.setAttribute('aria-pressed', String(show));
      button.setAttribute(
        'aria-label',
        show ? 'Ocultar senha da equipe' : 'Mostrar senha da equipe'
      );
    };
    wrapper.append(button);
  });
}
