var fotoPerfilActual = "";

function cargarCabeceraUsuario() {
    var div = document.getElementById("usuarioCabecera");
    if (!div) return;

    var datos = sessionStorage.getItem("usuarioActual");
    if (!datos) return;

    var u = JSON.parse(datos);

    div.innerHTML = "";

    var img = document.createElement("img");
    if (u.foto) img.src = u.foto;
    img.style.width = "40px";
    img.style.height = "40px";
    img.style.borderRadius = "50%";
    img.style.objectFit = "cover";

    var span = document.createElement("span");
    span.textContent = "Hola, " + u.nombre;

    div.appendChild(img);
    div.appendChild(span);

    var bloqueInq = document.querySelector(".subtarjeta:nth-child(1)");
    var bloqueProp = document.querySelector(".subtarjeta:nth-child(2)");

    if (u.perfil === "inquilino") {
        if (bloqueProp) bloqueProp.style.display = "none";
        if (bloqueInq) bloqueInq.style.display = "block";
    } else if (u.perfil === "propietario") {
        if (bloqueInq) bloqueInq.style.display = "none";
        if (bloqueProp) bloqueProp.style.display = "block";
    } else {
        if (bloqueInq) bloqueInq.style.display = "block";
        if (bloqueProp) bloqueProp.style.display = "block";
    }

    var inputNombre = document.getElementById("nombreUsuario");
    var imgPrev = document.getElementById("imgPreviewUsuario");
    if (inputNombre) inputNombre.value = u.nombre || "";
    if (imgPrev && u.foto) imgPrev.src = u.foto;
}

function iniciarPerfilUsuario() {
    var form = document.getElementById("formPerfilUsuario");
    var inputFoto = document.getElementById("fotoUsuario");
    if (inputFoto) {
        inputFoto.addEventListener("change", manejarFotoPerfil);
    }
    if (form) {
        form.addEventListener("submit", guardarPerfilUsuario);
    }
}

function manejarFotoPerfil(e) {
    var archivo = e.target.files[0];
    if (!archivo) return;
    var lector = new FileReader();
    lector.addEventListener("load", function () {
        fotoPerfilActual = lector.result;
        var imgPrev = document.getElementById("imgPreviewUsuario");
        if (imgPrev) imgPrev.src = lector.result;
    });
    lector.readAsDataURL(archivo);
}

function prepararLogout() {
    var btn = document.getElementById("btnLogout");
    if (!btn) return;
    btn.addEventListener("click", function () {
        sessionStorage.clear();
        window.location.href = "login.html";
    });
}

function guardarPerfilUsuario(e) {
    e.preventDefault();
    var datos = sessionStorage.getItem("usuarioActual");
    if (!datos) return;
    var u = JSON.parse(datos);

    var inputNombre = document.getElementById("nombreUsuario");
    var nuevoNombre = inputNombre ? inputNombre.value : "";
    if (nuevoNombre === "") return;

    var nuevaFoto = fotoPerfilActual || u.foto || "";

    actualizarUsuario(u.email, { nombre: nuevoNombre, foto: nuevaFoto }, function (ok) {
        if (ok) {
            u.nombre = nuevoNombre;
            u.foto = nuevaFoto;
            sessionStorage.setItem("usuarioActual", JSON.stringify(u));
            cargarCabeceraUsuario();
        }
    });
}

window.addEventListener("load", function () {
    cargarCabeceraUsuario();
    iniciarPerfilUsuario();
    prepararLogout();
});

