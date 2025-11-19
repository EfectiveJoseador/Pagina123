var formHabitacion;
var inputDirHab;
var inputCiudadHab;
var inputPrecioHab;
var inputLatHab;
var inputLonHab;
var inputTamanoHab;
var inputFotoHab;
var zonaDragHab;
var imgPreviewHab;
var listaMisHab;
var inputCambiarFoto;

var fotoActualHab = "";
var modoEdicion = false;
var idHabitacionEdicion = null;
var idHabitacionFoto = null;

function iniciarHabitaciones() {
    formHabitacion = document.getElementById("formHabitacion");
    inputDirHab = document.getElementById("dirHabitacion");
    inputCiudadHab = document.getElementById("ciudadHabitacion");
    inputPrecioHab = document.getElementById("precioHabitacion");
    inputLatHab = document.getElementById("latHabitacion");
    inputLonHab = document.getElementById("lonHabitacion");
    inputTamanoHab = document.getElementById("tamanoHabitacion");
    inputFotoHab = document.getElementById("fotoHabitacion");
    zonaDragHab = document.getElementById("zonaDrag");
    imgPreviewHab = document.getElementById("imgPreviewHabitacion");
    listaMisHab = document.getElementById("listaMisHabitaciones");
    inputCambiarFoto = document.getElementById("inputCambiarFoto");

    if (formHabitacion) {
        formHabitacion.addEventListener("submit", guardarHabitacion);
    }
    if (inputPrecioHab) {
        inputPrecioHab.addEventListener("input", validarPrecioHabitacion);
    }
    if (inputFotoHab) {
        inputFotoHab.addEventListener("change", manejarFotoNueva);
    }
    if (zonaDragHab) {
        zonaDragHab.addEventListener("dragover", cancelarDrag);
        zonaDragHab.addEventListener("drop", manejarDropNueva);
    }
    if (inputCambiarFoto) {
        inputCambiarFoto.addEventListener("change", manejarFotoCambiar);
    }

    if (listaMisHab) {
        cargarMisHabitaciones();
    }
}

function validarPrecioHabitacion() {
    if (!inputPrecioHab) return;
    var v = parseInt(inputPrecioHab.value, 10);
    if (isNaN(v) || v <= 0) {
        inputPrecioHab.setCustomValidity("Precio incorrecto");
    } else {
        inputPrecioHab.setCustomValidity("");
    }
}

function manejarFotoNueva(e) {
    var archivo = e.target.files[0];
    if (!archivo) return;
    leerFotoNueva(archivo);
}

function cancelarDrag(e) {
    e.preventDefault();
}

function manejarDropNueva(e) {
    e.preventDefault();
    var archivos = e.dataTransfer.files;
    if (!archivos || archivos.length === 0) return;
    var archivo = archivos[0];
    leerFotoNueva(archivo);
}

function leerFotoNueva(archivo) {
    var lector = new FileReader();
    lector.addEventListener("load", function () {
        fotoActualHab = lector.result;
        if (imgPreviewHab) {
            imgPreviewHab.src = lector.result;
        }
    });
    lector.readAsDataURL(archivo);
}

function manejarFotoCambiar(e) {
    var archivo = e.target.files[0];
    if (!archivo || idHabitacionFoto === null) return;
    var lector = new FileReader();
    lector.addEventListener("load", function () {
        var base64 = lector.result;
        actualizarFotoHabitacion(idHabitacionFoto, base64, function (ok) {
            if (ok) {
                idHabitacionFoto = null;
                cargarMisHabitaciones();
            }
        });
    });
    lector.readAsDataURL(archivo);
}

function guardarHabitacion(e) {
    e.preventDefault();
    if (!formHabitacion) return;

    var dir = inputDirHab ? inputDirHab.value : "";
    var ciudad = inputCiudadHab ? inputCiudadHab.value : "";
    var precio = inputPrecioHab ? parseInt(inputPrecioHab.value, 10) : 0;
    var lat = inputLatHab ? parseFloat(inputLatHab.value) : 0;
    var lon = inputLonHab ? parseFloat(inputLonHab.value) : 0;
    var tam = inputTamanoHab ? parseInt(inputTamanoHab.value, 10) : 0;

    if (dir === "" || ciudad === "" || isNaN(precio) || precio <= 0) {
        return;
    }

    var usuarioJSON = sessionStorage.getItem("usuarioActual");
    if (!usuarioJSON) return;
    var usuario = JSON.parse(usuarioJSON);

    if (modoEdicion && idHabitacionEdicion !== null) {
        var datos = {
            direccion: dir,
            ciudad: ciudad,
            precio: precio,
            latitud: lat,
            longitud: lon,
            tamano: tam,
            foto: fotoActualHab
        };
        actualizarDatosHabitacion(idHabitacionEdicion, datos, function (ok) {
            if (ok) {
                modoEdicion = false;
                idHabitacionEdicion = null;
                formHabitacion.reset();
                fotoActualHab = "";
                if (imgPreviewHab) {
                    imgPreviewHab.src = "";
                }
                cargarMisHabitaciones();
            }
        });
    } else {
        var habitacion = {
            direccion: dir,
            ciudad: ciudad,
            precio: precio,
            latitud: lat,
            longitud: lon,
            emailPropietario: usuario.email,
            foto: fotoActualHab,
            tamano: tam,
            activa: true
        };
        insertarHabitacion(habitacion, function (ok) {
            if (ok) {
                formHabitacion.reset();
                fotoActualHab = "";
                if (imgPreviewHab) {
                    imgPreviewHab.src = "";
                }
                cargarMisHabitaciones();
            }
        });
    }
}

function cargarMisHabitaciones() {
    if (!bd) {
        setTimeout(cargarMisHabitaciones, 300);
        return;
    }

    var usuarioJSON = sessionStorage.getItem("usuarioActual");
    if (!usuarioJSON || !listaMisHab) return;
    var usuario = JSON.parse(usuarioJSON);
    listaMisHab.innerHTML = "";

    obtenerHabitacionesDePropietario(usuario.email, function (lista) {
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

            var span = document.createElement("span");
            var texto = h.direccion + " - " + h.precio + "€ (" + h.ciudad + ")";
            if (h.tamano) {
                texto += " - " + h.tamano + " m²";
            }
            span.textContent = texto;

            img.addEventListener("click", crearManejadorDetalle(h));
            span.addEventListener("click", crearManejadorDetalle(h));

            var btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = "Cambiar foto";
            btn.addEventListener("click", crearManejadorCambiarFoto(h.id));

            div.appendChild(img);
            div.appendChild(span);
            div.appendChild(btn);

            listaMisHab.appendChild(div);
        }
    });
}

function crearManejadorDetalle(hab) {
    return function () {
        if (typeof mostrarDetalleHabitacion === "function") {
            mostrarDetalleHabitacion(hab);
        }
    };
}

function crearManejadorCambiarFoto(idHab) {
    return function () {
        idHabitacionFoto = idHab;
        if (inputCambiarFoto) {
            inputCambiarFoto.value = "";
            inputCambiarFoto.click();
        }
    };
}

function actualizarFotoHabitacion(idHab, base64, callback) {
    if (!bd) {
        if (callback) callback(false);
        return;
    }
    var tx = bd.transaction(["habitacion"], "readwrite");
    var store = tx.objectStore("habitacion");
    var peticion = store.get(idHab);
    peticion.addEventListener("success", function () {
        var h = peticion.result;
        if (!h) {
            if (callback) callback(false);
            return;
        }
        h.foto = base64;
        var peticionUpdate = store.put(h);
        peticionUpdate.addEventListener("success", function () {
            if (callback) callback(true);
        });
        peticionUpdate.addEventListener("error", function () {
            if (callback) callback(false);
        });
    });
    peticion.addEventListener("error", function () {
        if (callback) callback(false);
    });
}

function actualizarDatosHabitacion(idHab, datos, callback) {
    if (!bd) {
        if (callback) callback(false);
        return;
    }
    var tx = bd.transaction(["habitacion"], "readwrite");
    var store = tx.objectStore("habitacion");
    var peticion = store.get(idHab);
    peticion.addEventListener("success", function () {
        var h = peticion.result;
        if (!h) {
            if (callback) callback(false);
            return;
        }
        h.direccion = datos.direccion;
        h.ciudad = datos.ciudad;
        h.precio = datos.precio;
        h.latitud = datos.latitud;
        h.longitud = datos.longitud;
        h.tamano = datos.tamano;
        if (datos.foto && datos.foto !== "") {
            h.foto = datos.foto;
        }
        var peticionUpdate = store.put(h);
        peticionUpdate.addEventListener("success", function () {
            if (callback) callback(true);
        });
        peticionUpdate.addEventListener("error", function () {
            if (callback) callback(false);
        });
    });
    peticion.addEventListener("error", function () {
        if (callback) callback(false);
    });
}

function prepararEdicionHabitacion(h) {
    if (!formHabitacion) return;

    modoEdicion = true;
    idHabitacionEdicion = h.id;

    if (inputDirHab) inputDirHab.value = h.direccion || "";
    if (inputCiudadHab) inputCiudadHab.value = h.ciudad || "";
    if (inputPrecioHab) inputPrecioHab.value = h.precio || "";
    if (inputLatHab) inputLatHab.value = h.latitud || "";
    if (inputLonHab) inputLonHab.value = h.longitud || "";
    if (inputTamanoHab) inputTamanoHab.value = h.tamano || "";

    fotoActualHab = "";
    if (imgPreviewHab) {
        if (h.foto && h.foto !== "") {
            imgPreviewHab.src = h.foto;
        } else {
            imgPreviewHab.src = "";
        }
    }

    formHabitacion.scrollIntoView({ behavior: "smooth" });
}

window.addEventListener("load", iniciarHabitaciones);
