var listaAlqInquilino;
var listaSolInquilino;
var listaAlqPropietario;
var listaSolPropietario;

var btnAlqInquilino;
var btnSolInquilino;
var btnAlqPropietario;
var btnSolPropietario;

function iniciarAlquileres() {
    listaAlqInquilino = document.getElementById("listaAlquileresInquilino");
    listaSolInquilino = document.getElementById("listaSolicitudesInquilino");
    listaAlqPropietario = document.getElementById("listaAlquileresPropietario");
    listaSolPropietario = document.getElementById("listaSolicitudesPropietario");

    btnAlqInquilino = document.getElementById("btnVerAlquileresInquilino");
    btnSolInquilino = document.getElementById("btnVerSolicitudesInquilino");
    btnAlqPropietario = document.getElementById("btnVerAlquileresPropietario");
    btnSolPropietario = document.getElementById("btnVerSolicitudesPropietario");

    if (btnAlqInquilino) {
        btnAlqInquilino.addEventListener("click", cargarAlquileresInquilinoUI);
    }
    if (btnSolInquilino) {
        btnSolInquilino.addEventListener("click", cargarSolicitudesInquilinoUI);
    }
    if (btnAlqPropietario) {
        btnAlqPropietario.addEventListener("click", cargarAlquileresPropietarioUI);
    }
    if (btnSolPropietario) {
        btnSolPropietario.addEventListener("click", cargarSolicitudesPropietarioUI);
    }
}

function cargarAlquileresInquilinoUI(e) {
    if (e) e.preventDefault();
    var usuarioJSON = sessionStorage.getItem("usuarioActual");
    if (!usuarioJSON || !listaAlqInquilino) return;
    var usuario = JSON.parse(usuarioJSON);
    listaAlqInquilino.innerHTML = "";

    obtenerAlquileresPorInquilino(usuario.email, function (lista) {
        var i;
        for (i = 0; i < lista.length; i++) {
            var a = lista[i];
            var div = document.createElement("div");
            div.className = "itemAlquiler";
            var texto = "Hab " + a.idHabitacion + " - " + a.fechaInicio + " / " + a.fechaFin + " - Prop: " + a.emailPropietario;
            div.textContent = texto;
            listaAlqInquilino.appendChild(div);
        }
    });
}

function cargarSolicitudesInquilinoUI(e) {
    if (e) e.preventDefault();
    var usuarioJSON = sessionStorage.getItem("usuarioActual");
    if (!usuarioJSON || !listaSolInquilino) return;
    var usuario = JSON.parse(usuarioJSON);
    listaSolInquilino.innerHTML = "";

    obtenerSolicitudesPorInquilino(usuario.email, function (lista) {
        var i;
        for (i = 0; i < lista.length; i++) {
            var s = lista[i];
            var div = document.createElement("div");
            div.className = "itemSolicitud";
            var texto = "Hab " + s.idHabitacion + " - " + s.fechaInicioDeseada + " / " + s.fechaFinDeseada + " - Prop: " + s.emailPropietario;
            div.textContent = texto;
            listaSolInquilino.appendChild(div);
        }
    });
}

function cargarAlquileresPropietarioUI(e) {
    if (e) e.preventDefault();
    var usuarioJSON = sessionStorage.getItem("usuarioActual");
    if (!usuarioJSON || !listaAlqPropietario) return;
    var usuario = JSON.parse(usuarioJSON);
    listaAlqPropietario.innerHTML = "";

    obtenerAlquileresPorPropietario(usuario.email, function (lista) {
        var ahora = new Date().toISOString().substring(0, 10);
        var i;
        for (i = 0; i < lista.length; i++) {
            var a = lista[i];
            var div = document.createElement("div");
            div.className = "itemAlquiler";
            var estado = "no activa";
            if (a.fechaInicio <= ahora && a.fechaFin >= ahora) {
                estado = "activa";
            }
            var texto = "Hab " + a.idHabitacion + " - " + a.fechaInicio + " / " + a.fechaFin + " - Inq: " + a.emailInquilino + " (" + estado + ")";
            div.textContent = texto;
            listaAlqPropietario.appendChild(div);
        }
    });
}

function cargarSolicitudesPropietarioUI(e) {
    if (e) e.preventDefault();
    var usuarioJSON = sessionStorage.getItem("usuarioActual");
    if (!usuarioJSON || !listaSolPropietario) return;
    var usuario = JSON.parse(usuarioJSON);
    listaSolPropietario.innerHTML = "";

    obtenerSolicitudesPorPropietario(usuario.email, function (lista) {
        var i;
        for (i = 0; i < lista.length; i++) {
            var s = lista[i];
            var div = document.createElement("div");
            div.className = "itemSolicitud";
            var texto = "Hab " + s.idHabitacion + " - " + s.fechaInicioDeseada + " / " + s.fechaFinDeseada + " - Inq: " + s.emailInquilino;
            listaSolPropietario.appendChild(div);
        }
    });
}

window.addEventListener("load", iniciarAlquileres);
