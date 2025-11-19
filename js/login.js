var campoEmailLogin;
var campoPassLogin;
var msgErrorLogin;
var botonLogin;

function iniciarLogin() {
    campoEmailLogin = document.getElementById("email");
    campoPassLogin = document.getElementById("password");
    msgErrorLogin = document.getElementById("msgError");
    botonLogin = document.getElementById("btnLogin");

    if (campoEmailLogin) {
        campoEmailLogin.addEventListener("input", validarLogin);
    }
    if (campoPassLogin) {
        campoPassLogin.addEventListener("input", validarLogin);
    }
    if (botonLogin) {
        botonLogin.addEventListener("click", procesarLogin);
    }
}

function validarLogin() {
    if (!campoEmailLogin || !campoPassLogin) return;
    if (campoEmailLogin.value === "" || campoPassLogin.value === "") {
        campoEmailLogin.setCustomValidity("Rellena email y contraseña");
    } else {
        campoEmailLogin.setCustomValidity("");
    }
}

function procesarLogin(e) {
    e.preventDefault();
    if (!campoEmailLogin || !campoPassLogin) return;

    var email = campoEmailLogin.value;
    var pass = campoPassLogin.value;

    if (email === "" || pass === "") {
        msgErrorLogin.textContent = "Faltan datos";
        return;
    }

    buscarUsuario(email, pass, function (usuario) {
        if (!usuario) {
            msgErrorLogin.textContent = "Usuario o contraseña incorrectos";
        } else {
            var perfil = "inquilino";
            var datos = {
                email: usuario.email,
                nombre: usuario.nombre,
                foto: usuario.foto,
                perfil: perfil
            };
            sessionStorage.setItem("usuarioActual", JSON.stringify(datos));
            window.location.href = "principal.html";
        }
    });
}

window.addEventListener("load", iniciarLogin);
