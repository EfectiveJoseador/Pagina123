var bd;

function iniciarBD() {
    var peticion = indexedDB.open("vitobadixx", 1);
    peticion.addEventListener("upgradeneeded", crearBD);
    peticion.addEventListener("success", abrirOK);
    peticion.addEventListener("error", abrirError);
}

function crearBD(e) {
    bd = e.target.result;

    var almacenes = bd.objectStoreNames;
    if (!almacenes.contains("usuario")) {
        var storeUsuarios = bd.createObjectStore("usuario", { keyPath: "email" });
        storeUsuarios.add({ email: "endika@uni.es", password: "1111", nombre: "Endika", foto: "img/endika.png" });
        storeUsuarios.add({ email: "igor@uni.es", password: "2222", nombre: "Igor", foto: "img/igor.png" });
        storeUsuarios.add({ email: "kevin@uni.es", password: "3333", nombre: "Kevin", foto: "img/kevin.png" });
        storeUsuarios.add({ email: "ainhoa@uni.es", password: "4444", nombre: "Ainhoa", foto: "img/ainhoa.png" });
    }

    if (!almacenes.contains("habitacion")) {
        var storeHab = bd.createObjectStore("habitacion", { keyPath: "id", autoIncrement: true });
        storeHab.add({ direccion: "Calle 1 Vitoria", ciudad: "Vitoria", precio: 250, latitud: 42.85, longitud: -2.68, emailPropietario: "endika@uni.es", foto: "", tamano: 9, activa: true });
        storeHab.add({ direccion: "Calle 2 Vitoria", ciudad: "Vitoria", precio: 300, latitud: 42.84, longitud: -2.67, emailPropietario: "igor@uni.es", foto: "", tamano: 10, activa: true });
        storeHab.add({ direccion: "Calle 3 Bilbao", ciudad: "Bilbao", precio: 400, latitud: 43.26, longitud: -2.93, emailPropietario: "kevin@uni.es", foto: "", tamano: 14, activa: true });
        storeHab.add({ direccion: "Calle 4 Bilbao", ciudad: "Bilbao", precio: 350, latitud: 43.27, longitud: -2.92, emailPropietario: "ainhoa@uni.es", foto: "", tamano: 12, activa: true });
        storeHab.add({ direccion: "Calle 5 Donostia", ciudad: "Donostia", precio: 380, latitud: 43.31, longitud: -1.98, emailPropietario: "endika@uni.es", foto: "", tamano: 13, activa: true });
        storeHab.add({ direccion: "Calle 6 Donostia", ciudad: "Donostia", precio: 290, latitud: 43.32, longitud: -1.99, emailPropietario: "igor@uni.es", foto: "", tamano: 11, activa: true });
    }

    if (!almacenes.contains("alquiler")) {
        bd.createObjectStore("alquiler", { keyPath: "id", autoIncrement: true });
    }

    if (!almacenes.contains("solicitud")) {
        bd.createObjectStore("solicitud", { keyPath: "id", autoIncrement: true });
    }
}

function abrirOK(e) {
    bd = e.target.result;
}

function abrirError() {
    console.log("Error al abrir la BD");
}

function buscarUsuario(email, password, callback) {
    if (!bd) {
        callback(null);
        return;
    }
    var tx = bd.transaction(["usuario"], "readonly");
    var store = tx.objectStore("usuario");
    var peticion = store.get(email);
    peticion.addEventListener("success", function () {
        var u = peticion.result;
        if (u && u.password === password) {
            callback(u);
        } else {
            callback(null);
        }
    });
    peticion.addEventListener("error", function () {
        callback(null);
    });
}

function buscarUsuarioPorEmail(email, callback) {
    if (!bd) {
        callback(null);
        return;
    }
    var tx = bd.transaction(["usuario"], "readonly");
    var store = tx.objectStore("usuario");
    var peticion = store.get(email);
    peticion.addEventListener("success", function () {
        callback(peticion.result || null);
    });
    peticion.addEventListener("error", function () {
        callback(null);
    });
}



function buscarHabitacionesPorCiudad(ciudad, fechaISO, callback) {
    if (!bd) {
        callback([]);
        return;
    }
    var tx = bd.transaction(["habitacion"], "readonly");
    var store = tx.objectStore("habitacion");
    var habitaciones = [];
    var cursor = store.openCursor();
    cursor.addEventListener("success", function (e) {
        var cur = e.target.result;
        if (cur) {
            var h = cur.value;
            if (h.ciudad === ciudad) {
                habitaciones.push(h);
            }
            cur.continue();
        } else {
            habitaciones.sort(function (a, b) {
                return a.precio - b.precio;
            });
            callback(habitaciones);
        }
    });
}

function insertarHabitacion(habitacion, callback) {
    if (!bd) {
        if (callback) callback(false);
        return;
    }
    var tx = bd.transaction(["habitacion"], "readwrite");
    var store = tx.objectStore("habitacion");
    var peticion = store.add(habitacion);
    peticion.addEventListener("success", function () {
        if (callback) callback(true);
    });
    peticion.addEventListener("error", function () {
        if (callback) callback(false);
    });
}

function obtenerHabitacionesDePropietario(email, callback) {
    if (!bd) {
        callback([]);
        return;
    }
    var tx = bd.transaction(["habitacion"], "readonly");
    var store = tx.objectStore("habitacion");
    var lista = [];
    var cursor = store.openCursor();
    cursor.addEventListener("success", function (e) {
        var cur = e.target.result;
        if (cur) {
            var h = cur.value;
            if (h.emailPropietario === email) {
                lista.push(h);
            }
            cur.continue();
        } else {
            callback(lista);
        }
    });
}

function obtenerAlquileresPorInquilino(email, callback) {
    if (!bd) {
        callback([]);
        return;
    }
    var tx = bd.transaction(["alquiler"], "readonly");
    var store = tx.objectStore("alquiler");
    var lista = [];
    var cursor = store.openCursor();
    cursor.addEventListener("success", function (e) {
        var cur = e.target.result;
        if (cur) {
            var a = cur.value;
            if (a.emailInquilino === email) {
                lista.push(a);
            }
            cur.continue();
        } else {
            lista.sort(function (x, y) {
                if (x.fechaFin < y.fechaFin) return -1;
                if (x.fechaFin > y.fechaFin) return 1;
                return 0;
            });
            callback(lista);
        }
    });
}

function obtenerSolicitudesPorInquilino(email, callback) {
    if (!bd) {
        callback([]);
        return;
    }
    var tx = bd.transaction(["solicitud"], "readonly");
    var store = tx.objectStore("solicitud");
    var lista = [];
    var cursor = store.openCursor();
    cursor.addEventListener("success", function (e) {
        var cur = e.target.result;
        if (cur) {
            var s = cur.value;
            if (s.emailInquilino === email) {
                lista.push(s);
            }
            cur.continue();
        } else {
            callback(lista);
        }
    });
}

function obtenerAlquileresPorPropietario(email, callback) {
    if (!bd) {
        callback([]);
        return;
    }
    var tx = bd.transaction(["alquiler"], "readonly");
    var store = tx.objectStore("alquiler");
    var lista = [];
    var cursor = store.openCursor();
    cursor.addEventListener("success", function (e) {
        var cur = e.target.result;
        if (cur) {
            var a = cur.value;
            if (a.emailPropietario === email) {
                lista.push(a);
            }
            cur.continue();
        } else {
            lista.sort(function (x, y) {
                if (x.fechaFin < y.fechaFin) return -1;
                if (x.fechaFin > y.fechaFin) return 1;
                return 0;
            });
            callback(lista);
        }
    });
}

function obtenerSolicitudesPorPropietario(email, callback) {
    if (!bd) {
        callback([]);
        return;
    }
    var tx = bd.transaction(["solicitud"], "readonly");
    var store = tx.objectStore("solicitud");
    var lista = [];
    var cursor = store.openCursor();
    cursor.addEventListener("success", function (e) {
        var cur = e.target.result;
        if (cur) {
            var s = cur.value;
            if (s.emailPropietario === email) {
                lista.push(s);
            }
            cur.continue();
        } else {
            callback(lista);
        }
    });
}

iniciarBD();
