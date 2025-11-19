var formBuscarPublico;
var ciudadPublico;
var fechaPublico;
var listaPublico;

var formBuscarPrivado;
var ciudadPrivado;
var fechaPrivado;
var listaPrivado;

var inputLatCentro;
var inputLonCentro;
var selectRadio;
var btnGeo;
var listaGeo;

var habDetalleActual = null;

function iniciarBusquedas() {
    formBuscarPublico = document.getElementById("formBuscarPublico");
    ciudadPublico = document.getElementById("selCiudadPublico");
    fechaPublico = document.getElementById("fechaPublico");
    listaPublico = document.getElementById("listaResultadosPublico");

    formBuscarPrivado = document.getElementById("formBuscarPrivado");
    ciudadPrivado = document.getElementById("selCiudadPrivado");
    fechaPrivado = document.getElementById("fechaPrivado");
    listaPrivado = document.getElementById("listaResultadosPrivado");

    inputLatCentro = document.getElementById("latCentro");
    inputLonCentro = document.getElementById("lonCentro");
    selectRadio = document.getElementById("radioGeo");
    btnGeo = document.getElementById("btnGeo");
    listaGeo = document.getElementById("listaResultadosGeo");

    if (formBuscarPublico) {
        formBuscarPublico.addEventListener("submit", buscarPublico);
    }
    if (formBuscarPrivado) {
        formBuscarPrivado.addEventListener("submit", buscarPrivado);
    }
    if (btnGeo) {
        btnGeo.addEventListener("click", buscarGeo);
    }
}

function buscarPublico(e) {
    e.preventDefault();
    if (!ciudadPublico || !listaPublico) return;
    var ciudad = ciudadPublico.value;
    var fecha = fechaPublico ? fechaPublico.value : "";

    listaPublico.innerHTML = "";

    buscarHabitacionesPorCiudad(ciudad, fecha, function (lista) {
        var i;
        for (i = 0; i < lista.length; i++) {
            var h = lista[i];

            var div = document.createElement("div");
            div.className = "itemHabitacion";

            var img = document.createElement("img");
            if (h.foto && h.foto !== "") {
                img.src = h.foto;
            } else {
                img.src = "img/habitacion_defecto.png";
            }
            img.width = 80;
            img.height = 60;
            img.className = "foto-difuminada";

            var span = document.createElement("span");
            var texto = h.direccion + " - " + h.precio + "€";
            if (h.tamano) {
                texto += " - " + h.tamano + " m²";
            }
            span.textContent = texto;

            div.appendChild(img);
            div.appendChild(span);

            div.addEventListener("click", crearManejadorDetalle(h));

            listaPublico.appendChild(div);
        }
    });
}

function buscarPrivado(e) {
    e.preventDefault();
    if (!ciudadPrivado || !listaPrivado) return;

    var ciudad = ciudadPrivado.value;
    var fecha = fechaPrivado ? fechaPrivado.value : "";
    listaPrivado.innerHTML = "";

    var usuarioJSON = sessionStorage.getItem("usuarioActual");
    if (!usuarioJSON) return;
    var usuario = JSON.parse(usuarioJSON);

    buscarHabitacionesPorCiudad(ciudad, fecha, function (lista) {
        var i;
        for (i = 0; i < lista.length; i++) {
            var h = lista[i];
            if (h.emailPropietario === usuario.email) {
                continue;
            }

            var div = document.createElement("div");
            div.className = "itemHabitacion";

            var img = document.createElement("img");
            if (h.foto && h.foto !== "") {
                img.src = h.foto;
            } else {
                img.src = "img/habitacion_defecto.png";
            }
            img.width = 80;
            img.height = 60;

            var span = document.createElement("span");
            var texto = h.direccion + " (" + h.latitud + ", " + h.longitud + ") - " + h.precio + "€";
            if (h.tamano) {
                texto += " - " + h.tamano + " m²";
            }
            span.textContent = texto;

            div.appendChild(img);
            div.appendChild(span);

            div.addEventListener("click", crearManejadorDetalle(h));

            listaPrivado.appendChild(div);
        }
    });
}

function crearManejadorDetalle(hab) {
    return function () {
        mostrarDetalleHabitacion(hab);
    };
}

function buscarGeo(e) {
    e.preventDefault();
    if (!inputLatCentro || !inputLonCentro || !selectRadio || !listaGeo) return;

    var lat = parseFloat(inputLatCentro.value);
    var lon = parseFloat(inputLonCentro.value);
    var radio = parseFloat(selectRadio.value);

    if (isNaN(lat) || isNaN(lon) || isNaN(radio)) {
        return;
    }

    listaGeo.innerHTML = "";

    var usuarioJSON = sessionStorage.getItem("usuarioActual");
    if (!usuarioJSON) return;
    var usuario = JSON.parse(usuarioJSON);

    var tx = bd.transaction(["habitacion"], "readonly");
    var store = tx.objectStore("habitacion");
    var cursor = store.openCursor();
    cursor.addEventListener("success", function (e2) {
        var cur = e2.target.result;
        if (cur) {
            var h = cur.value;
            if (h.emailPropietario !== usuario.email) {
                var d = distanciaKM(lat, lon, h.latitud, h.longitud);
                if (d <= radio) {
                    var div = document.createElement("div");
                    div.className = "itemHabitacion";
                    var texto = h.direccion + " - " + h.precio + "€ (" + d.toFixed(2) + " km)";
                    if (h.tamano) {
                        texto += " - " + h.tamano + " m²";
                    }
                    div.textContent = texto;
                    div.addEventListener("click", crearManejadorDetalle(h));
                    listaGeo.appendChild(div);
                }
            }
            cur.continue();
        }
    });
}

function distanciaKM(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

function mostrarDetalleHabitacion(h) {
    habDetalleActual = h;

    var seccion = document.getElementById("detalleHabitacion");
    if (!seccion) return;

    var imgHab = document.getElementById("detFotoHab");
    var pDir = document.getElementById("detDireccion");
    var pCiudad = document.getElementById("detCiudad");
    var pTam = document.getElementById("detTamano");
    var pPrecio = document.getElementById("detPrecio");
    var imgProp = document.getElementById("detFotoProp");
    var nomProp = document.getElementById("detNombreProp");
    var emailProp = document.getElementById("detEmailProp");
    var btnEditar = document.getElementById("btnEditarHabitacion");

    if (imgHab) {
        if (h.foto && h.foto !== "") {
            imgHab.src = h.foto;
        } else {
            imgHab.src = "img/habitacion_defecto.png";
        }
    }
    if (pDir) pDir.textContent = "Dirección: " + h.direccion;
    if (pCiudad) pCiudad.textContent = "Ciudad: " + h.ciudad;
    if (pTam) pTam.textContent = "Tamaño: " + (h.tamano ? h.tamano + " m²" : "No especificado");
    if (pPrecio) pPrecio.textContent = "Precio: " + h.precio + " €";
    if (emailProp) emailProp.textContent = h.emailPropietario || "";

    buscarUsuarioPorEmail(h.emailPropietario, function (u) {
        if (!u) {
            if (imgProp) imgProp.src = "";
            if (nomProp) nomProp.textContent = "";
        } else {
            if (imgProp) imgProp.src = u.foto || "";
            if (nomProp) nomProp.textContent = u.nombre || "";
        }
    });

    if (btnEditar) {
        var usuarioJSON = sessionStorage.getItem("usuarioActual");
        var puedeEditar = false;
        if (usuarioJSON) {
            var usuario = JSON.parse(usuarioJSON);
            if (usuario.email === h.emailPropietario) {
                puedeEditar = true;
            }
        }
        if (puedeEditar && typeof prepararEdicionHabitacion === "function") {
            btnEditar.style.display = "inline-block";
            btnEditar.onclick = function () {
                prepararEdicionHabitacion(h);
            };
        } else {
            btnEditar.style.display = "none";
            btnEditar.onclick = null;
        }
    }

    seccion.style.display = "block";
    seccion.scrollIntoView({ behavior: "smooth" });
}

window.addEventListener("load", iniciarBusquedas);
