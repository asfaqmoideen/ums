'use strict'

class LoginController {
    constructor() {

    }
    validateUser = async (username, password) => {
        try {
            const response = await fetch("https://dummyjson.com/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });
            if (response.status !== 200) {
                const { message } = await response.json()
                throw message
            }
            const jsonData = await response.json();
            sessionStorage.setItem("accessToken", jsonData.accessToken);
            document.location = '/src/pages/ums.html';
        } catch (error) {
            this.displayErrorMessage(error);

        }
    };
    displayErrorMessage(err) {
        const errorMessage = document.getElementById("error");
        errorMessage.textContent = err;
        const loginForm = document.getElementById("login-form");
        loginForm.uname.classList.add("is-invalid")
        loginForm.password.classList.add("is-invalid")

    }
}
document.addEventListener("DOMContentLoaded", () => {
    const loginCon = new LoginController();
    const unameErr = document.getElementById("uname-err");

    const accessToken = sessionStorage.getItem('accessToken');
    if (accessToken) {
        document.location = '/src/pages/ums.html'
        return
    }
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await loginCon.validateUser(loginForm.uname.value, loginForm.password.value);
        if (!loginForm.checkValidity()) {
            unameErr.textContent = "Required field!";

        }
    });
    loginForm.uname.addEventListener('input', () => {
        const unameErr = document.getElementById("uname-err");
        const unameregex = /^[a-z0-9]+$/;
        if (!unameregex.test(loginForm.uname.value)) {
            loginForm.uname.classList.remove("is-valid")
            loginForm.uname.classList.add("is-invalid")
            unameErr.textContent = "Invalid username";
            if (loginForm.uname.value == '') {
                unameErr.textContent = "Required field!";

            }

        } else {
            loginForm.uname.classList.remove("is-invalid")

            loginForm.uname.classList.add("is-valid")
            unameErr.textContent = "";
        }

    });
    loginForm.password.addEventListener('input', () => {
        const passErr = document.getElementById("pass-err");
        const passRegex = /^.{8,16}$/;
        if (!passRegex.test(loginForm.password.value)) {
            loginForm.password.classList.remove("is-valid")
            loginForm.password.classList.add("is-invalid")
            passErr.textContent = "Too short or too long!";
            if (loginForm.password.value == '') {
                passErr.textContent = "Required field!";

            }
        } else {
            loginForm.password.classList.remove("is-invalid")
            loginForm.password.classList.add("is-valid")
            passErr.textContent = "";
        }
    })

});


