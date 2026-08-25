(function () {
  "use strict";

  const STORAGE_KEY = "webengage_demo_users";

  /* =========================================================
     ELEMENT REFERENCES
  ========================================================= */

  const tabLogin = document.getElementById("tabLogin");
  const tabSignup = document.getElementById("tabSignup");
  const tabIndicator = document.getElementById("tabIndicator");

  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  const formStatus = document.getElementById("formStatus");

  const goToSignup = document.getElementById("goToSignup");
  const goToLogin = document.getElementById("goToLogin");
  const forgotLink = document.getElementById("forgotLink");


  /* =========================================================
     WEBENGAGE HELPER
     
     This prevents errors if WebEngage hasn't loaded yet.
  ========================================================= */

  function isWebEngageReady() {
    return typeof window.webengage !== "undefined";
  }


  /* =========================================================
     TAB SWITCHING
  ========================================================= */

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


  /* =========================================================
     STATUS MESSAGE
  ========================================================= */

  function setStatus(message, isError) {

    formStatus.textContent = message;

    formStatus.classList.toggle(
      "error",
      Boolean(isError)
    );
  }

  function clearStatus() {

    formStatus.textContent = "";

    formStatus.classList.remove("error");
  }


  /* =========================================================
     PASSWORD SHOW / HIDE
  ========================================================= */

  document
    .querySelectorAll(".toggle-visibility")
    .forEach((btn) => {

      btn.addEventListener("click", () => {

        const input = document.getElementById(
          btn.dataset.target
        );

        const showing = input.type === "text";

        input.type = showing
          ? "password"
          : "text";

        btn.textContent = showing
          ? "Show"
          : "Hide";
      });

    });


  /* =========================================================
     HELPERS
  ========================================================= */

  function isValidEmail(value) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  }


  function setFieldError(
    inputEl,
    errorEl,
    message
  ) {

    errorEl.textContent = message || "";

    inputEl.classList.toggle(
      "invalid",
      Boolean(message)
    );

  }


  function getUsers() {

    try {

      return (
        JSON.parse(
          localStorage.getItem(STORAGE_KEY)
        ) || []
      );

    } catch (e) {

      return [];

    }

  }


  function saveUsers(users) {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(users)
      );

    } catch (e) {

      console.log(
        "Local storage unavailable."
      );

    }

  }


  /* =========================================================
     PASSWORD STRENGTH
  ========================================================= */

  const signupPassword =
    document.getElementById("signupPassword");

  const strengthBar =
    document.getElementById("strengthBar");


  signupPassword.addEventListener(
    "input",
    () => {

      const val =
        signupPassword.value;

      let score = 0;

      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      const percentages = [
        0,
        25,
        55,
        80,
        100
      ];

      const colors = [
        "#C0402B",
        "#C0402B",
        "#E0A527",
        "#4C8F6E",
        "#3A6B5C"
      ];

      strengthBar.style.width =
        percentages[score] + "%";

      strengthBar.style.backgroundColor =
        colors[score];

    }
  );


  /* =========================================================
     SIGNUP
  ========================================================= */

  signupForm.addEventListener(
    "submit",
    (e) => {

      e.preventDefault();

      clearStatus();


      const nameEl =
        document.getElementById("signupName");

      const companyEl =
        document.getElementById("signupCompany");

      const emailEl =
        document.getElementById("signupEmail");

      const passwordEl =
        document.getElementById("signupPassword");

      const confirmEl =
        document.getElementById("signupConfirm");

      const agreeEl =
        document.getElementById("agreeTerms");


      const nameErr =
        document.getElementById("signupNameError");

      const emailErr =
        document.getElementById("signupEmailError");

      const passwordErr =
        document.getElementById("signupPasswordError");

      const confirmErr =
        document.getElementById("signupConfirmError");

      const agreeErr =
        document.getElementById("agreeTermsError");


      /* Clear previous errors */

      [
        nameEl,
        emailEl,
        passwordEl,
        confirmEl
      ].forEach((el) => {

        el.classList.remove("invalid");

      });


      [
        nameErr,
        emailErr,
        passwordErr,
        confirmErr,
        agreeErr
      ].forEach((el) => {

        el.textContent = "";

      });


      let valid = true;


      /* Name */

      if (!nameEl.value.trim()) {

        setFieldError(
          nameEl,
          nameErr,
          "Enter your full name."
        );

        valid = false;

      }


      /* Email */

      const email =
        emailEl.value
          .trim()
          .toLowerCase();


      if (!isValidEmail(email)) {

        setFieldError(
          emailEl,
          emailErr,
          "Enter a valid work email."
        );

        valid = false;

      }

      else if (
        getUsers().some(
          (u) => u.email === email
        )
      ) {

        setFieldError(
          emailEl,
          emailErr,
          "An account with this email already exists."
        );

        valid = false;

      }


      /* Password */

      if (passwordEl.value.length < 8) {

        setFieldError(
          passwordEl,
          passwordErr,
          "Use at least 8 characters."
        );

        valid = false;

      }


      /* Confirm password */

      if (
        confirmEl.value !==
          passwordEl.value ||
        !confirmEl.value
      ) {

        setFieldError(
          confirmEl,
          confirmErr,
          "Passwords don't match."
        );

        valid = false;

      }


      /* Terms */

      if (!agreeEl.checked) {

        agreeErr.textContent =
          "You need to accept the terms to continue.";

        valid = false;

      }


      /* Stop if invalid */

      if (!valid) {

        setStatus(
          "Please fix the highlighted fields.",
          true
        );

        return;

      }


      /* =====================================================
         CREATE LOCAL DEMO USER
      ===================================================== */

      const users = getUsers();

      const newUser = {

        name: nameEl.value.trim(),

        company:
          companyEl.value.trim(),

        email: email,

        password:
          passwordEl.value

      };


      users.push(newUser);

      saveUsers(users);


      /* =====================================================
         WEBENGAGE — IDENTIFY USER
      ===================================================== */

      if (isWebEngageReady()) {

        /*
         * Identify the newly registered user.
         *
         * For learning purposes we are using email
         * as the user ID.
         *
         * In a real application, use your database
         * generated user/customer ID instead.
         */

        webengage.user.login(email);


        /*
         * Send user attributes to WebEngage.
         */

        webengage.user.setAttribute({

          "we_first_name":
            nameEl.value.trim(),

          "we_email":
            email,

          "company":
            companyEl.value.trim()

        });


        /*
         * Track signup as a custom event.
         */

        webengage.track(
          "Account Created",
          {

            "Email":
              email,

            "Company":
              companyEl.value.trim(),

            "Signup Method":
              "Website"

          }
        );


        console.log(
          "WebEngage: Account Created tracked"
        );

      }

      else {

        console.warn(
          "WebEngage SDK is not available yet."
        );

      }


      /* =====================================================
         RESET FORM
      ===================================================== */

      const createdEmail = email;

      signupForm.reset();

      strengthBar.style.width = "0%";


      showForm("login");


      setStatus(
        "Account created for " +
          createdEmail +
          ". Log in below."
      );

    }
  );


  /* =========================================================
     LOGIN
  ========================================================= */

  loginForm.addEventListener(
    "submit",
    (e) => {

      e.preventDefault();

      clearStatus();


      const emailEl =
        document.getElementById("loginEmail");

      const passwordEl =
        document.getElementById("loginPassword");


      const emailErr =
        document.getElementById("loginEmailError");

      const passwordErr =
        document.getElementById("loginPasswordError");


      emailEl.classList.remove("invalid");
      passwordEl.classList.remove("invalid");

      emailErr.textContent = "";
      passwordErr.textContent = "";


      let valid = true;


      /* Validate email */

      const email =
        emailEl.value
          .trim()
          .toLowerCase();


      if (!isValidEmail(email)) {

        setFieldError(
          emailEl,
          emailErr,
          "Enter a valid email address."
        );

        valid = false;

      }


      /* Validate password */

      if (!passwordEl.value) {

        setFieldError(
          passwordEl,
          passwordErr,
          "Enter your password."
        );

        valid = false;

      }


      if (!valid) {

        return;

      }


      /* =====================================================
         FIND LOCAL DEMO USER
      ===================================================== */

      const users = getUsers();

      const match =
        users.find(
          (u) =>
            u.email === email
        );


      if (!match) {

        setStatus(
          "No account found with that email. Try signing up.",
          true
        );

        return;

      }


      if (
        match.password !==
        passwordEl.value
      ) {

        setFieldError(
          passwordEl,
          passwordErr,
          "Incorrect password."
        );

        setStatus(
          "That password doesn't match.",
          true
        );

        return;

      }


      /* =====================================================
         WEBENGAGE — LOGIN USER
      ===================================================== */

      if (isWebEngageReady()) {

        /*
         * Identify the user.
         */

        webengage.user.login(
          match.email
        );


        /*
         * Set user attributes.
         */

        webengage.user.setAttribute({

          "we_first_name":
            match.name,

          "we_email":
            match.email,

          "company":
            match.company || ""

        });


        /*
         * Track login event.
         */

        webengage.track(
          "Demo Login",
          {

            "Email":
              match.email,

            "Login Method":
              "Website"

          }
        );


        console.log(
          "WebEngage: Demo Login tracked"
        );

      }

      else {

        console.warn(
          "WebEngage SDK is not available."
        );

      }


      /* =====================================================
         SUCCESS MESSAGE
      ===================================================== */

      setStatus(
        "Welcome back, " +
          match.name.split(" ")[0] +
          ". You're logged in."
      );


      loginForm.reset();

    }
  );


  /* =========================================================
     FORGOT PASSWORD
  ========================================================= */

  forgotLink.addEventListener(
    "click",
    (e) => {

      e.preventDefault();

      setStatus(
        "Password reset isn't wired up in this demo — try creating a new account instead."
      );

    }
  );


  /* =========================================================
     DECORATIVE STATS
  ========================================================= */

  const statVisitors =
    document.getElementById(
      "statVisitors"
    );

  const statEvents =
    document.getElementById(
      "statEvents"
    );


  let visitors = 128;
  let events = 940;


  function tickStats() {

    visitors +=
      Math.round(
        Math.random() * 6 - 3
      );

    events +=
      Math.round(
        Math.random() * 40 - 10
      );


    visitors =
      Math.max(80, visitors);

    events =
      Math.max(400, events);


    statVisitors.textContent =
      visitors.toLocaleString();

    statEvents.textContent =
      events.toLocaleString();

  }


  tickStats();

  setInterval(
    tickStats,
    2200
  );


})();
