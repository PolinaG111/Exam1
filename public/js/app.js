document.querySelectorAll('[data-date-mask="ru"]').forEach((input) => {
  input.addEventListener("input", (event) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 8);
    const parts = [];

    if (digits.length > 0) {
      parts.push(digits.slice(0, 2));
    }

    if (digits.length > 2) {
      parts.push(digits.slice(2, 4));
    }

    if (digits.length > 4) {
      parts.push(digits.slice(4, 8));
    }

    event.target.value = parts.join(".");
  });
});

document.querySelectorAll(".app-toast").forEach((toastElement) => {
  if (window.bootstrap?.Toast) {
    const toast = new window.bootstrap.Toast(toastElement, { delay: 3200 });
    toast.show();
  }
});

const statusModalElement = document.getElementById("statusConfirmModal");

if (statusModalElement && window.bootstrap?.Modal) {
  const modal = new window.bootstrap.Modal(statusModalElement);
  const modalStatusLabel = statusModalElement.querySelector("[data-modal-status-label]");
  const confirmButton = statusModalElement.querySelector("[data-confirm-status-submit]");
  let pendingForm = null;

  document.querySelectorAll(".admin-status-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      pendingForm = form;

      const selectedStatus = form.querySelector('select[name="status"]')?.value || "Не выбран";
      if (modalStatusLabel) {
        modalStatusLabel.textContent = selectedStatus;
      }

      modal.show();
    });
  });

  confirmButton?.addEventListener("click", () => {
    if (pendingForm) {
      pendingForm.submit();
    }
  });
}
