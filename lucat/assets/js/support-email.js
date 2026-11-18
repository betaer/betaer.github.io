for (const link of document.querySelectorAll("a[data-support-email]")) {
  const label = link.querySelector("[data-email-label]");
  if (!label) continue;

  const button = document.createElement("button");
  button.type = "button";
  button.dataset.supportEmail = "";
  label.textContent = label.dataset.emailLabel;
  button.append(...link.childNodes);
  link.replaceWith(button);

  button.addEventListener("click", () => {
    const address = atob("YmV0YWVyQGxpdmUuY29t");
    label.textContent = address;
    link.href = "mailto:" + address;
    link.append(...button.childNodes);
    button.replaceWith(link);
    link.focus({ preventScroll: true });
    link.click();
  }, { once: true });
}
