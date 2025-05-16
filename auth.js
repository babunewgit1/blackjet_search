//form hide and none
document.addEventListener("DOMContentLoaded", function () {
  // code for auth popup show
  const loginBtn = document.querySelector("#login");
  const authPopUpWrapper = document.querySelector(".auth-popup");
  const authBlockPopup = document.querySelector(".auth_block_popup");
  const authForget = document.querySelector(".auth_forget");

  loginBtn.addEventListener("click", function () {
    authPopUpWrapper.classList.add("active_popup");
    // Ensure login form is shown and forget password form is hidden
    authBlockPopup.style.display = "block";
    authForget.style.display = "none";
    // Set signin tab as active
    document.querySelector("#signin").classList.add("active_form");
    document.querySelector("#signup").classList.remove("active_form");
    // Show signin block and hide signup block
    document.querySelector("[data='signin']").style.display = "block";
    document.querySelector("[data='signup']").style.display = "none";
  });

  // code for auth popup hide
  const crossBtn = document.querySelector(".auth_cross img");
  crossBtn.addEventListener("click", function () {
    authPopUpWrapper.classList.remove("active_popup");
  });

  // code for tab switching between "signup and signin"
  const tabItem = document.querySelectorAll(".auth_tab_block span");
  const tabCnt = document.querySelectorAll(".sign_up_block");
  tabItem.forEach((item) => {
    item.addEventListener("click", function () {
      tabItem.forEach((active) => {
        active.classList.remove("active_form");
      });
      const tabItemAttr = item.getAttribute("id");
      tabCnt.forEach((tabCntItem) => {
        const tabCntAttr = tabCntItem.getAttribute("data");
        if (tabItemAttr === tabCntAttr) {
          tabCntItem.style.display = "block";
        } else {
          tabCntItem.style.display = "none";
        }
      });
      item.classList.add("active_form");
    });
  });

  // code for forgetpass and back to login page
  const forgetPassLink = document.querySelector(".forget_pass");
  const backToLogin = document.querySelector(".backtologin");
  forgetPassLink.addEventListener("click", function (e) {
    e.preventDefault();
    authBlockPopup.style.display = "none";
    authForget.style.display = "block";
  });
  backToLogin.addEventListener("click", function (e) {
    e.preventDefault();
    authForget.style.display = "none";
    authBlockPopup.style.display = "block";
  });
});

// Toast system
class Toast {
  constructor(element) {
    this.element = element;
    this.closeBtn = element.querySelector(".btn-close");
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.hide());
    }
  }

  show() {
    if (!this.element) return;
    this.element.classList.add("show");
    setTimeout(() => this.hide(), 3000);
  }

  hide() {
    if (!this.element) return;
    this.element.classList.remove("show");
  }
}

// Initialize toast when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const toastElement = document.getElementById("notificationToast");
  if (toastElement) {
    window.toast = new Toast(toastElement);
  } else {
    console.error("Toast element not found!");
  }
});

// Function to show toast message
function showToastMessage(message) {
  const toastMessage = document.getElementById("toastMessage");
  if (toastMessage && window.toast) {
    toastMessage.textContent = message;
    window.toast.show();
  } else {
    console.error("Toast elements not found!");
  }
}

// Function to update UI based on login state
function updateUIForLoggedInUser(userEmail) {
  const loginLink = document.querySelector(".login_link");
  const userAccLink = document.querySelector(".account_holder");

  if (userEmail && typeof userEmail === "string") {
    if (loginLink) loginLink.style.display = "none";
    if (userAccLink) userAccLink.style.display = "block";
  } else {
    if (loginLink) loginLink.style.display = "block";
    if (userAccLink) userAccLink.style.display = "none";
  }
}

// Auth system
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup_form");
  const loginForm = document.getElementById("loginform");
  const logoutBtn = document.querySelector(".logoutbtn");
  const forgotPasswordForm = document.querySelector(".auth_forget form");

  // Check initial login state
  const userEmail = Cookies.get("userEmail");
  const authToken = Cookies.get("authToken");
  if (userEmail && authToken) {
    updateUIForLoggedInUser(userEmail);
  }

  // Signup Form Handler
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Get form values
      const firstname = document
        .getElementById("signup_firstname")
        .value.trim();
      const lastname = document.getElementById("signup_lastname").value.trim();
      const email = document.getElementById("signup_email").value.trim();
      const password = document.getElementById("signup_password").value;
      const confirmPassword = document.getElementById(
        "signup_confirmpassword"
      ).value;

      // Password match check
      if (password !== confirmPassword) {
        showToastMessage("Passwords do not match!");
        return;
      }

      // API call
      try {
        const response = await fetch(
          "https://operators-dashboard.bubbleapps.io/api/1.1/wf/webflow_signup_blackjet",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              first_name: firstname,
              last_name: lastname,
              password,
              email,
            }),
          }
        );

        const data = await response.json();

        if (response.ok && data.response && data.response.token) {
          // Store user data in cookies
          Cookies.set("userEmail", email, { expires: 7, secure: true });
          Cookies.set("authToken", data.response.token, {
            expires: 7,
            secure: true,
          });

          showToastMessage("Sign up Successfull");
          console.log("Token:", data.response.token);
          console.log("Email:", email);
          signupForm.reset();

          // Update UI for logged in state
          updateUIForLoggedInUser(email);

          // Update account details heading
          const accountNameSpan = document.querySelector(
            ".account_det_h3 span"
          );
          if (accountNameSpan) {
            accountNameSpan.textContent = `${data.response.firstname} ${data.response.lastname}`;
          }

          // Remove active_popup class
          const authPopup = document.querySelector(".auth-popup");
          if (authPopup) {
            authPopup.classList.remove("active_popup");
          }
        } else {
          showToastMessage(
            "Signup failed: " + (data.message || "Unknown error")
          );
        }
      } catch (error) {
        showToastMessage("An error occurred during signup. Please try again.");
      }
    });
  }

  // Login Form Handler
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Get form values
      const email = document.getElementById("login_email").value.trim();
      const password = document.getElementById("login_password").value;

      try {
        const response = await fetch(
          "https://operators-dashboard.bubbleapps.io/api/1.1/wf/webflow_login_blackjet",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

        const data = await response.json();

        if (response.ok && data.response) {
          // Store user data in cookies
          Cookies.set("userEmail", email, { expires: 7, secure: true });
          if (data.response.token) {
            Cookies.set("authToken", data.response.token, {
              expires: 7,
              secure: true,
            });
          }

          showToastMessage("Login Successful!");
          console.log(data.response);
          console.log("First Name:", data.response.firstname);
          console.log("Last Name:", data.response.lastname);
          loginForm.reset();

          // Update UI for logged in state
          updateUIForLoggedInUser(email);

          // Update account details heading
          const accountNameSpan = document.querySelector(
            ".account_det_h3 span"
          );
          if (accountNameSpan) {
            accountNameSpan.textContent = `${data.response.firstname} ${data.response.lastname}`;
          }

          // Remove active_popup class
          const authPopup = document.querySelector(".auth-popup");
          if (authPopup) {
            authPopup.classList.remove("active_popup");
          }
        } else {
          showToastMessage(
            "Login failed: " + (data.message || "Invalid credentials")
          );
        }
      } catch (error) {
        showToastMessage("An error occurred during login. Please try again.");
      }
    });
  }

  // Logout handler
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        // Get the auth token from cookies
        const token = Cookies.get("authToken");

        if (!token) {
          showToastMessage(
            "Authentication token is missing. Please log in again."
          );
          return;
        }

        // Hit the logout API endpoint
        const response = await fetch(
          "https://operators-dashboard.bubbleapps.io/api/1.1/wf/webflow_logout_blackjet",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          // Clear cookies
          Cookies.remove("userEmail");
          Cookies.remove("authToken");

          // Update UI for logged out state
          updateUIForLoggedInUser(null);

          // Remove show_account class
          const accountDetails = document.querySelector(".account_details");
          if (accountDetails) {
            accountDetails.classList.remove("show_account");
          }

          showToastMessage("Logged out successfully!");
        } else {
          showToastMessage("Logout failed. Please try again.");
        }
      } catch (error) {
        console.error("Error during logout:", error);
        showToastMessage("An error occurred during logout. Please try again.");
      }
    });
  }

  // Forgot Password Form Handler
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("forget_email").value.trim();

      try {
        const response = await fetch(
          "https://operators-dashboard.bubbleapps.io/api/1.1/wf/webflow_forgotpassword_blackjet",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          showToastMessage(
            "Password reset instructions have been sent to your email!"
          );
          forgotPasswordForm.reset();
        } else {
          showToastMessage(
            "Failed to process request: " + (data.message || "Please try again")
          );
        }
      } catch (error) {
        showToastMessage("An error occurred. Please try again.");
      }
    });
  }
});

// my account popup open or close
document.addEventListener("DOMContentLoaded", function () {
  const accountHolder = document.querySelector(".account_holder");
  const accountDetails = document.querySelector(".account_details");
  const crossx = document.querySelector("img.crossx");

  accountHolder.addEventListener("click", function () {
    accountDetails.classList.add("show_account");
  });

  crossx.addEventListener("click", function (e) {
    e.stopPropagation();
    accountDetails.classList.remove("show_account");
  });
});

// add class in scroll
document.addEventListener("DOMContentLoaded", function () {
  window.addEventListener("scroll", function () {
    const menu = document.querySelector(".header");

    if (window.scrollY > 0) {
      menu.classList.add("black");
    } else {
      menu.classList.remove("black");
    }
  });
});
