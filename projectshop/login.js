const API_BASE = "https://shopapi.stepacademy.ge/api";
const API_KEY = "7314be17-7c09-4ef0-9b82-887b8485d325";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const submitButton = document.getElementById("submitButton");
const passwordInput = document.getElementById("password");
const rememberMe = document.getElementById("rememberMe");

function getToken(result) {
    const data = result?.data ?? result;

    if (typeof data === "string") {
        return data;
    }

    return data?.token ||
        data?.accessToken ||
        data?.jwt ||
        data?.data?.token ||
        data?.data?.accessToken ||
        "";
}

loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    loginMessage.textContent = "";
    loginMessage.classList.remove("success");
    submitButton.disabled = true;
    submitButton.innerHTML = 'Signing in... <i class="fa-solid fa-spinner fa-spin"></i>';

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: {
                "X-API-Key": "7314be17-7c09-4ef0-9b82-887b8485d325",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                result.message ||
                result.title ||
                "Email or password is incorrect."
            );
        }

        const token = getToken(result);

        if (!token) {
            throw new Error("The login response did not include an access token.");
        }

        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");

        const storage = rememberMe.checked ? localStorage : sessionStorage;
        storage.setItem("authToken", token);

        loginMessage.textContent = "Signed in. Taking you to the shop...";
        loginMessage.classList.add("success");
        window.location.href = "index.html";
    } catch (error) {
        loginMessage.textContent =
            error.message || "Could not sign in. Please try again.";

        submitButton.disabled = false;
        submitButton.innerHTML =
            'Sign In <i class="fa-solid fa-arrow-right"></i>';
    }
});

document.getElementById("togglePassword").addEventListener("click", event => {
    const showPassword = passwordInput.type === "password";
    passwordInput.type = showPassword ? "text" : "password";

    event.currentTarget.setAttribute(
        "aria-label",
        showPassword ? "Hide password" : "Show password"
    );

    event.currentTarget.innerHTML = showPassword
        ? '<i class="fa-regular fa-eye-slash"></i>'
        : '<i class="fa-regular fa-eye"></i>';
});