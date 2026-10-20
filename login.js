import { createClient } from
  "https://esm.sh/@supabase/supabase-js@2";

// Replace these with your own Supabase project details.
const SUPABASE_URL = "https://rmvmwpldqgahfnknckhh.supabase.co";
const SUPABASE_KEY = "sb_publishable_P1WEvLAFyU5JFLumNLiagg_UQz0Jhv2";

const supabase = createClient(
  
  SUPABASE_URL,
  SUPABASE_KEY
);
console.log("Supabase URL:", SUPABASE_URL);

const { data, error } = await supabase.auth.getSession();
console.log("Session test:", data, error);

const form = document.getElementById("account-form");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const status = document.getElementById("status");
const signupButton = document.getElementById("signup-button");
const loginButton = document.getElementById("login-button");

function showStatus(message, isError = false) {
  status.textContent = message;
  status.style.color = isError ? "#ff7777" : "#8ce99a";
}

function setLoading(loading) {
  signupButton.disabled = loading;
  loginButton.disabled = loading;
}

// SIGN UP
signupButton.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    showStatus(
      "Username must be 3–20 characters using letters, numbers, or underscores.",
      true
    );
    return;
  }

  if (!email || password.length < 8) {
    showStatus(
      "Enter a valid email and a password of at least 8 characters.",
      true
    );
    return;
  }

  setLoading(true);
  showStatus("Creating your account...");

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (error) throw error;

    if (data.session) {
      window.location.href = "map.html";
    } else {
      showStatus(
        "Account created! Check your email to confirm your account, then log in."
      );
    }
  } catch (error) {
    showStatus(error.message || "Sign-up failed.", true);
  } finally {
    setLoading(false);
  }
});

// LOG IN
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  setLoading(true);
  showStatus("Logging in...");

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    window.location.href = "map.html";
  } catch (error) {
    showStatus(error.message || "Login failed.", true);
  } finally {
    setLoading(false);
  }
});

// If the player is already logged in, send them to the map.
async function checkExistingSession() {
  const { data, error } = await supabase.auth.getSession();

  if (!error && data.session) {
    window.location.replace("map.html");
  }
}

checkExistingSession();
