const express = require("express");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 4000;
const HOST = "0.0.0.0";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    return next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({
        ok: true,
        mensaje: "Backend de Quincho Paraíso funcionando.",
    });
});

app.post("/api/reservas", async (req, res) => {
    const {
        nombre,
        telefono,
        email,
        fecha,
        cantidad,
        quincho,
        mensaje = "",
    } = req.body;

    if (!nombre || !telefono || !email || !fecha || !cantidad || !quincho) {
        return res.status(400).json({
            ok: false,
            mensaje: "Completá todos los campos obligatorios.",
        });
    }

    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const destinationNumber = process.env.WHATSAPP_DESTINATION_NUMBER;
    const graphApiVersion = process.env.GRAPH_API_VERSION || "v25.0";

    if (!token || !phoneNumberId || !destinationNumber) {
        console.error("Faltan variables de WhatsApp en el archivo .env");

        return res.status(500).json({
            ok: false,
            mensaje: "El servidor todavía no tiene configurada la API de WhatsApp.",
        });
    }

    if (token.includes("pega_aqui")) {
        return res.status(500).json({
            ok: false,
            mensaje: "Pegá tu token temporal de Meta en WHATSAPP_TOKEN dentro del archivo .env.",
        });
    }

    const nombresQuinchos = {
        sauce: "Quincho El Sauce",
        acacias: "Quincho Las Acacias",
        ombu: "Quincho El Ombú",
    };

    const texto = [
        "*Nueva consulta de reserva*",
        "",
        `*Nombre:* ${nombre}`,
        `*Teléfono:* ${telefono}`,
        `*Email:* ${email}`,
        `*Fecha:* ${fecha}`,
        `*Personas:* ${cantidad}`,
        `*Quincho:* ${nombresQuinchos[quincho] || quincho}`,
        `*Mensaje:* ${mensaje.trim() || "Sin mensaje adicional"}`,
    ].join("\n");

    const numeroDestino = destinationNumber.replace(/\D/g, "");

    if (numeroDestino.length < 10) {
        return res.status(500).json({
            ok: false,
            mensaje: "Configurá WHATSAPP_DESTINATION_NUMBER con tu número real, incluyendo código de país y área.",
        });
    }

    console.log(`Enviando reserva por WhatsApp a ${numeroDestino}`);

    try {
        const respuestaWhatsApp = await fetch(
            `https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}/messages`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: numeroDestino,
                    type: "text",
                    text: {
                        preview_url: false,
                        body: texto,
                    },
                }),
            }
        );

        const resultado = await respuestaWhatsApp.json();

        if (!respuestaWhatsApp.ok) {
            console.error("Error de WhatsApp Cloud API:", resultado);

            return res.status(502).json({
                ok: false,
                mensaje:
                    resultado?.error?.message ||
                    "WhatsApp rechazó el envío. Revisá token, Phone Number ID y número destino.",
            });
        }

        const messageId = resultado?.messages?.[0]?.id;

        console.log("WhatsApp Cloud API aceptó el mensaje:", {
            messageId,
            recipient: resultado?.contacts?.[0]?.wa_id,
        });

        return res.json({
            ok: true,
            mensaje: "Consulta enviada correctamente por WhatsApp.",
            messageId,
        });
    } catch (error) {
        console.error("No se pudo contactar a WhatsApp Cloud API:", error);

        return res.status(502).json({
            ok: false,
            mensaje: "No se pudo conectar con WhatsApp Cloud API en este momento.",
        });
    }
});

app.listen(PORT, HOST, () => {
    console.log(
        `Servidor funcionando en http://localhost:${PORT}`
    );
});
