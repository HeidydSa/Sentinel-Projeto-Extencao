export function showToast(msg, type = '') {
  const toastContainer = document.getElementById('toast-container');

  if (!toastContainer) {
    const toastContainerEl = document.createElement('div');
    toastContainerEl.id = 'toast-container';
    toastContainerEl.setAttribute('role', 'region');
    toastContainerEl.setAttribute('aria-live', 'polite');
    toastContainerEl.className = 'toast-container';
    document.body.appendChild(toastContainerEl);
    return showToast(msg, type);
  }

  const newToast = document.createElement('div');
  newToast.className = 'toast' + (type ? ' ' + type : '');
  newToast.textContent = msg;
  newToast.ariaRoleDescription = 'status';
  newToast.ariaLive = 'polite';

  toastContainer.appendChild(newToast);

  setTimeout(() => {
    newToast.classList.add('show');
  }, 100);

  setTimeout(() => {
    newToast.classList.remove('show');
    setTimeout(() => toastContainer.removeChild(newToast), 300);
  }, 2500);
}
