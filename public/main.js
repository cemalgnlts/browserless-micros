const drawerContentEl = document.querySelector(".drawer-content");
const progressEl = document.querySelector("progress");
const articleEl = document.querySelector("article");
const anchorEls = document.querySelectorAll("a");
const btnUseApiKey = document.querySelector("#btnAddApiKey");
const inputApiKey = document.querySelector("#inputApiKey");

window.onpopstate = () => updateRoute();
anchorEls.forEach((el) => (el.onclick = handleLink));
btnUseApiKey.onclick = useApiKey;

updateRoute();
highlightMenuItem();

if(sessionStorage.getItem("api-key")) {
  inputApiKey.value = sessionStorage.getItem("api-key");
  useApiKey();
}

function handleLink(ev) {
  ev.preventDefault();

  navigate(ev.target.href);
  highlightMenuItem();
}

function highlightMenuItem() {
  const prevLink = document.querySelector("a.active");
  if (prevLink) prevLink.classList.remove("active");

  const targetLink = location.pathname;

  document.querySelector(`li > a[href="${targetLink}"]`).classList.add("active");
}

function navigate(path) {
  history.pushState({}, path, path);
  updateRoute();
}

async function updateRoute() {
  progressEl.classList.remove("hidden");

  let path = location.pathname;

  if (path === "/") path = "/docs/introduction";

  const req = await fetch(path);
  const html = req.ok ? await req.text() : "<h2>Error occured! Referesh page</h2>";
  articleEl.innerHTML = html;

  document.querySelectorAll("pre code").forEach(el => hljs.highlightElement(el));

  progressEl.classList.add("hidden");
  drawerContentEl.scrollTo(0, 0);
}

function useApiKey() {
  // if(!inputApiKey.checkValidity()) {
  //   inputApiKey.setCustomValidity("Your browserless.api key is incorrect");
  //   inputApiKey.reportValidity();
  //   return;
  // }

  const apiKey = inputApiKey.value.trim();
  
  if(apiKey) sessionStorage.setItem("api-key", apiKey);
  else sessionStorage.removeItem("api-key");

  const cssToken = apiKey ? "text-error" : "text-success";
  const newCssToken = apiKey ? "text-success" : "text-error";

  document.querySelector("#btnLock")
    .classList
    .replace(cssToken, newCssToken);
}

async function sendForm(btn) {
  const [form] = document.forms;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  btn.disabled = true;

  const formData = new FormData(form);
  const body = {};

  formData.forEach((value, key) => (body[key] = value));

  const req = await fetch(form.action, {
    method: form.method,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": sessionStorage.getItem("api-key")
    },
    body: JSON.stringify(body),
  });
  const res = await req.json();

  const highlight = hljs.highlightAuto(JSON.stringify(res, null, 2)).value.trim();
  document.querySelector("#meta").innerHTML = `<pre><code>${highlight}</code></pre>`;

  btn.disabled = false;
}
