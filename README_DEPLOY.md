# Despliegue con GitHub Pages + Render

Esta carpeta tiene dos partes:

```text
docs/    -> pagina estatica para GitHub Pages
backend/ -> servidor Node para Render
```

## Importante

No subas ningun archivo `.env` con tokens reales.
El token de Meta se carga en Render como variable de entorno.

## 1. Subir el proyecto a GitHub

1. Crea un repositorio publico en GitHub.
2. Sube toda esta carpeta `Proyecto_GitHub_Render`.
3. Verifica que NO hayas subido un archivo `.env`.

## 2. Publicar el frontend en GitHub Pages

En el repositorio de GitHub:

1. Entra a `Settings`.
2. Entra a `Pages`.
3. En `Source`, elige `Deploy from a branch`.
4. Branch: `main`.
5. Folder: `/docs`.
6. Guarda.

La URL quedara parecida a:

```text
https://tuusuario.github.io/nombre-del-repo/
```

## 3. Publicar el backend en Render

En Render:

1. Crea una cuenta o inicia sesion.
2. Crea un `New Web Service`.
3. Conecta el repositorio de GitHub.
4. Configura:

```text
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

5. En `Environment Variables`, agrega:

```env
GRAPH_API_VERSION=v25.0
WHATSAPP_TOKEN=tu_token_de_meta
WHATSAPP_PHONE_NUMBER_ID=1337722642756604
WHATSAPP_DESTINATION_NUMBER=543878689384
FRONTEND_ORIGIN=*
```

Para una demo se puede usar `FRONTEND_ORIGIN=*`.
Para dejarlo mas prolijo despues, reemplazalo por tu URL de GitHub Pages.

Render te dara una URL parecida a:

```text
https://quincho-paraiso-backend.onrender.com
```

## 4. Conectar el frontend con Render

Abre:

```text
docs/script.js
```

Cambia esta linea:

```js
const API_BASE_URL = "PEGAR_URL_DE_RENDER_AQUI";
```

por la URL de Render:

```js
const API_BASE_URL = "https://quincho-paraiso-backend.onrender.com";
```

Despues sube el cambio a GitHub.

## 5. Probar

1. Abre la URL de GitHub Pages.
2. Completa el formulario.
3. El backend de Render enviara el WhatsApp.

Si el mensaje no llega, responde "Hola" al numero de prueba de Meta desde WhatsApp y vuelve a enviar el formulario.

## Notas

Los servicios gratis de Render pueden dormir si pasan varios minutos sin uso.
Antes de exponer, abri la URL del backend una vez para despertarlo.
