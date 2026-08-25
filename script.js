(function () {
  "use strict";

  const STORAGE_KEY = "webengage_demo_users";

  /* ---------- Element refs ---------- */
  const tabLogin = document.getElementById("tabLogin");
  const tabSignup = document.getElementById("tabSignup");
  const tabIndicator = document.getElementById("tabIndicator");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const formStatus = document.getElementById("formStatus");
  const goToSignup = document.getElementById("goToSignup");
  const goToLogin = document.getElementById("goToLogin");
  const forgotLink = document.getElementById("forgotLink");

  /* ---------- Tab switching ---------- */
  function showForm(which) {
    const isLogin = which === "login";

    tabLogin.classList.toggle("is-active", isLogin);
    tabSignup.classList.toggle("is-active", !isLogin);
    tabLogin.setAttribute("aria-selected", String(isLogin));
    tabSignup.setAttribute("aria-selected", String(!isLogin));
    tabIndicator.classList.toggle("shift", !isLogin);

    loginForm.classList.toggle("is-active", isLogin);
    signupForm.classList.toggle("is-active", !isLogin);

    clearStatus();
  }

  tabLogin.addEventListener("click", () => showForm("login"));
  tabSignup.addEventListener("click", () => showForm("signup"));
  goToSignup.addEventListener("click", () => showForm("signup"));
  goToLogin.addEventListener("click", () => showForm("login"));

  /* ---------- Status message ---------- */
  function setStatus(message, isError) {
    formStatus.textContent = message;
    formStatus.classList.toggle("error", Boolean(isError));
  }
  function clearStatus() {
    formStatus.textContent = "";
    formStatus.classList.remove("error");
  }

  /* ---------- Password show/hide ---------- */
  document.querySelectorAll(".toggle-visibility").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      btn.textContent = showing ? "Show" : "Hide";
    });
  });

  /* ---------- Helpers ---------- */
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setFieldError(inputEl, errorEl, message) {
    errorEl.textContent = message || "";
    inputEl.classList.toggle("invalid", Boolean(message));
  }

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      /* storage unavailable — demo continues without persistence */
    }
  }

  /* ---------- Password strength meter ---------- */
  const signupPassword = document.getElementById("signupPassword");
  const strengthBar = document.getElementById("strengthBar");

  signupPassword.addEventListener("input", () => {
    const val = signupPassword.value;
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const percentages = [0, 25, 55, 80, 100];
    const colors = ["#C0402B", "#C0402B", "#E0A527", "#4C8F6E", "#3A6B5C"];
    strengthBar.style.width = percentages[score] + "%";
    strengthBar.style.backgroundColor = colors[score];
  });

  /* ---------- Signup ---------- */
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearStatus();

    const nameEl = document.getElementById("signupName");
    const emailEl = document.getElementById("signupEmail");
    const passwordEl = document.getElementById("signupPassword");
    const confirmEl = document.getElementById("signupConfirm");
    const agreeEl = document.getElementById("agreeTerms");

    const nameErr = document.getElementById("signupNameError");
    const emailErr = document.getElementById("signupEmailError");
    const passwordErr = document.getElementById("signupPasswordError");
    const confirmErr = document.getElementById("signupConfirmError");
    const agreeErr = document.getElementById("agreeTermsError");

    [nameEl, emailEl, passwordEl, confirmEl].forEach((el) =>
      el.classList.remove("invalid")
    );
    [nameErr, emailErr, passwordErr, confirmErr, agreeErr].forEach(
      (el) => (el.textContent = "")
    );

    let valid = true;

    if (!nameEl.value.trim()) {
      setFieldError(nameEl, nameErr, "Enter your full name.");
      valid = false;
    }

    if (!isValidEmail(emailEl.value.trim())) {
      setFieldError(emailEl, emailErr, "Enter a valid work email.");
      valid = false;
    } else if (getUsers().some((u) => u.email === emailEl.value.trim().toLowerCase())) {
      setFieldError(emailEl, emailErr, "An account with this email already exists.");
      valid = false;
    }

    if (passwordEl.value.length < 8) {
      setFieldError(passwordEl, passwordErr, "Use at least 8 characters.");
      valid = false;
    }

    if (confirmEl.value !== passwordEl.value || !confirmEl.value) {
      setFieldError(confirmEl, confirmErr, "Passwords don't match.");
      valid = false;
    }

    if (!agreeEl.checked) {
      agreeErr.textContent = "You need to accept the terms to continue.";
      valid = false;
    }

    if (!valid) {
      setStatus("Please fix the highlighted fields.", true);
      return;
    }

    const users = getUsers();
    users.push({
      name: nameEl.value.trim(),
      company: document.getElementById("signupCompany").value.trim(),
      email: emailEl.value.trim().toLowerCase(),
      password: passwordEl.value, // demo only — never store plain-text passwords in production
    });
    saveUsers(users);

    const createdEmail = emailEl.value.trim();
    signupForm.reset();
    strengthBar.style.width = "0%";
    showForm("login");
    setStatus("Account created for " + createdEmail + ". Log in below.");
  });

  /* ---------- Login ---------- */
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearStatus();

    const emailEl = document.getElementById("loginEmail");
    const passwordEl = document.getElementById("loginPassword");
    const emailErr = document.getElementById("loginEmailError");
    const passwordErr = document.getElementById("loginPasswordError");

    [emailEl, passwordEl].forEach((el) => el.classList.remove("invalid"));
    emailErr.textContent = "";
    passwordErr.textContent = "";

    let valid = true;

    if (!isValidEmail(emailEl.value.trim())) {
      setFieldError(emailEl, emailErr, "Enter a valid email address.");
      valid = false;
    }
    if (!passwordEl.value) {
      setFieldError(passwordEl, passwordErr, "Enter your password.");
      valid = false;
    }
    if (!valid) return;

    const users = getUsers();
    const match = users.find(
      (u) => u.email === emailEl.value.trim().toLowerCase()
    );

    if (!match) {
      setStatus("No account found with that email. Try signing up.", true);
      return;
    }
    if (match.password !== passwordEl.value) {
      setFieldError(passwordEl, passwordErr, "Incorrect password.");
      setStatus("That password doesn't match.", true);
      return;
    }

    setStatus("Welcome back, " + match.name.split(" ")[0] + ". You're logged in.");
    loginForm.reset();
  });

  forgotLink.addEventListener("click", (e) => {
    e.preventDefault();
    setStatus("Password reset isn't wired up in this demo — try creating a new account instead.");
  });

  /* ---------- Ambient stat counters (decorative) ---------- */
  const statVisitors = document.getElementById("statVisitors");
  const statEvents = document.getElementById("statEvents");
  let visitors = 128;
  let events = 940;

  function tickStats() {
    visitors += Math.round(Math.random() * 6 - 3);
    events += Math.round(Math.random() * 40 - 10);
    visitors = Math.max(80, visitors);
    events = Math.max(400, events);
    statVisitors.textContent = visitors.toLocaleString();
    statEvents.textContent = events.toLocaleString();
  }
  tickStats();
  setInterval(tickStats, 2200);
})();
