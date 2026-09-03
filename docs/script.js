/* =========================
   MENÚ DE NAVEGACIÓN
========================= */

const API_BASE_URL = "PEGAR_URL_DE_RENDER_AQUI";

const botonMenu = document.querySelector(".header__menu");
const menuPrincipal = document.getElementById("menu-principal");

if (botonMenu && menuPrincipal) {

    function cerrarMenu() {
        menuPrincipal.classList.remove(
            "header__nav--abierto"
        );

        botonMenu.setAttribute(
            "aria-expanded",
            "false"
        );

        botonMenu.setAttribute(
            "aria-label",
            "Abrir menú de navegación"
        );
    }


    botonMenu.addEventListener("click", () => {
        const menuAbierto =
            menuPrincipal.classList.toggle(
                "header__nav--abierto"
            );

        botonMenu.setAttribute(
            "aria-expanded",
            String(menuAbierto)
        );

        botonMenu.setAttribute(
            "aria-label",
            menuAbierto
                ? "Cerrar menú de navegación"
                : "Abrir menú de navegación"
        );
    });


    const enlacesMenu =
        menuPrincipal.querySelectorAll(
            ".header__enlace"
        );

    enlacesMenu.forEach((enlace) => {
        enlace.addEventListener(
            "click",
            cerrarMenu
        );
    });


    document.addEventListener(
        "keydown",
        (evento) => {
            if (evento.key === "Escape") {
                cerrarMenu();
            }
        }
    );


    document.addEventListener(
        "click",
        (evento) => {
            const clickDentroDelMenu =
                menuPrincipal.contains(
                    evento.target
                );

            const clickEnBoton =
                botonMenu.contains(
                    evento.target
                );

            if (
                !clickDentroDelMenu &&
                !clickEnBoton
            ) {
                cerrarMenu();
            }
        }
    );

}

/* =========================
   DIALOG
========================= */

const botonesDetalles =
    document.querySelectorAll("[data-dialog]");

const botonesCerrar =
    document.querySelectorAll(".detalles__cerrar");

const dialogs =
    document.querySelectorAll(".detalles");

function abrirDialog(dialog) {
    dialog.showModal();

    document.body.classList.add(
        "dialog-abierto"
    );

    requestAnimationFrame(() => {
        dialog.classList.add(
            "detalles--visible"
        );
    });
}

function cerrarDialog(dialog) {
    if (!dialog.open) return;

    dialog.classList.remove(
        "detalles--visible"
    );

    setTimeout(() => {
        dialog.close();

        document.body.classList.remove(
            "dialog-abierto"
        );
    }, 300);
}

botonesDetalles.forEach((boton) => {
    boton.addEventListener("click", () => {
        const dialogId =
            boton.dataset.dialog;

        const dialog =
            document.getElementById(dialogId);

        if (!dialog) return;

        abrirDialog(dialog);
    });
});

botonesCerrar.forEach((boton) => {
    boton.addEventListener("click", () => {
        const dialog =
            boton.closest("dialog");

        if (!dialog) return;

        cerrarDialog(dialog);
    });
});

dialogs.forEach((dialog) => {
    dialog.addEventListener(
        "click",
        (evento) => {
            if (evento.target === dialog) {
                cerrarDialog(dialog);
            }
        }
    );
    dialog.addEventListener(
        "cancel",
        (evento) => {
            evento.preventDefault();

            cerrarDialog(dialog);
        }
    );


    dialog.addEventListener(
        "close",
        () => {
            document.body.classList.remove(
                "dialog-abierto"
            );

            dialog.classList.remove(
                "detalles--visible"
            );
        }
    );
});



/* =========================
   FORMULARIO DE RESERVA
========================= */

const campoFecha = document.getElementById("fecha");

if (campoFecha) {
    const hoy = new Date();

    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");

    const fechaMinima = `${anio}-${mes}-${dia}`;

    campoFecha.min = fechaMinima;
}

const campoQuincho = document.getElementById("quincho");
const campoCantidad = document.getElementById("cantidad");

if (campoQuincho && campoCantidad) {
    campoQuincho.addEventListener("change", () => {
        const opcionSeleccionada =
            campoQuincho.options[campoQuincho.selectedIndex];

        const capacidad =
            opcionSeleccionada.dataset.capacidad;

        if (!capacidad) return;

        campoCantidad.max = capacidad;

        if (
            Number(campoCantidad.value) >
            Number(capacidad)
        ) {
            campoCantidad.value = capacidad;
        }
    });
}

const formularioReserva = document.getElementById("formulario-reserva");
const estadoFormulario = document.getElementById("formulario-estado");

if (formularioReserva && estadoFormulario) {
    formularioReserva.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        if (!formularioReserva.reportValidity()) return;

        const botonEnviar = formularioReserva.querySelector(
            'button[type="submit"]'
        );
        const textoOriginal = botonEnviar.textContent;
        const datos = Object.fromEntries(
            new FormData(formularioReserva).entries()
        );

        botonEnviar.disabled = true;
        botonEnviar.textContent = "Enviando...";
        estadoFormulario.textContent = "Enviando consulta...";

        try {
            if (API_BASE_URL === "PEGAR_URL_DE_RENDER_AQUI") {
                throw new Error(
                    "Falta configurar la URL del backend en script.js."
                );
            }

            const respuesta = await fetch(`${API_BASE_URL}/api/reservas`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(datos),
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    resultado.mensaje || "No se pudo enviar la consulta."
                );
            }

            estadoFormulario.textContent = resultado.mensaje;
            formularioReserva.reset();
            campoCantidad.removeAttribute("max");
        } catch (error) {
            estadoFormulario.textContent = error.message;
        } finally {
            botonEnviar.disabled = false;
            botonEnviar.textContent = textoOriginal;
        }
    });
}

/* =========================
   FOOTER
========================= */

const anioActual = document.getElementById("anio-actual");

if (anioActual) {
    anioActual.textContent =
        new Date().getFullYear();
}
