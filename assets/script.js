/* EQO portfolio — interactions. Edit CONFIG below. */
const CONFIG = {
  // Contact form opens the visitor's email app addressed to this address.
  // Replace with your real email (or connect a form service such as Formspree).
  email: "your@email.com"
};

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* Header: shadow on scroll, active link, back-to-top */
const header = $(".header"), topBtn = $(".top");
const links = $$(".menu a[href^='#']:not(.cta)");
const sections = links.map(a => $(a.getAttribute("href"))).filter(Boolean);
function onScroll() {
  const y = window.scrollY;
  header.classList.toggle("scrolled", y > 10);
  topBtn.classList.toggle("show", y > 700);
  let current = "";
  sections.forEach(s => { if (y + 140 >= s.offsetTop) current = "#" + s.id; });
  links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === current));
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* Mobile menu */
const burger = $(".burger"), menu = $(".menu");
function setMenu(open) {
  menu.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
}
burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
$$(".menu a").forEach(a => a.addEventListener("click", () => setMenu(false)));

/* Reveal on scroll */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: .12 });
$$(".reveal").forEach(el => io.observe(el));

/* Works filter */
const works = $$(".work");
$$(".filters button").forEach(btn => btn.addEventListener("click", () => {
  $$(".filters button").forEach(b => { b.classList.remove("on"); b.setAttribute("aria-pressed", "false"); });
  btn.classList.add("on"); btn.setAttribute("aria-pressed", "true");
  const f = btn.dataset.filter;
  works.forEach(w => w.classList.toggle("hide", f !== "all" && w.dataset.cat !== f));
}));

/* Lightbox */
const lb = $(".lightbox");
let lastFocus = null;
function openLb(w) {
  lastFocus = w;
  $(".lb-img", lb).style.backgroundImage = w.querySelector(".img").style.backgroundImage;
  $(".lb-cat", lb).textContent = w.dataset.catlabel;
  $(".lb-title", lb).textContent = w.dataset.title;
  $(".lb-desc", lb).textContent = w.dataset.desc;
  lb.classList.add("open");
  document.body.style.overflow = "hidden";
  $(".lb-close", lb).focus();
}
function closeLb() {
  lb.classList.remove("open");
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
}
works.forEach(w => w.addEventListener("click", () => openLb(w)));
$(".lb-close", lb).addEventListener("click", closeLb);
lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { if (lb.classList.contains("open")) closeLb(); setMenu(false); }
});

/* Accordion */
$$(".acc-btn").forEach(btn => btn.addEventListener("click", () => {
  const open = btn.getAttribute("aria-expanded") === "true";
  $$(".acc-btn").forEach(b => b.setAttribute("aria-expanded", "false"));
  btn.setAttribute("aria-expanded", String(!open));
}));

/* Contact form: validate, then open the visitor's email app */
const form = $("#contact-form"), status = $(".status");
const rules = {
  name: v => v.trim().length >= 2,
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  message: v => v.trim().length >= 10
};
form.addEventListener("submit", e => {
  e.preventDefault();
  let ok = true;
  Object.keys(rules).forEach(k => {
    const input = form.elements[k];
    const valid = rules[k](input.value);
    input.closest(".field").classList.toggle("err", !valid);
    input.setAttribute("aria-invalid", String(!valid));
    if (!valid) ok = false;
  });
  status.className = "status";
  if (!ok) { status.textContent = "Please fix the highlighted fields."; status.classList.add("bad"); return; }
  const d = Object.fromEntries(new FormData(form));
  const subject = encodeURIComponent("Project enquiry from " + d.name);
  const body = encodeURIComponent(d.message + "\n\n— " + d.name + " (" + d.email + ")");
  status.textContent = "Opening your email app…";
  status.classList.add("ok");
  window.location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
  form.reset();
});

$("#year").textContent = new Date().getFullYear();
