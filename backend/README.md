# Quincho Paraíso en Laravel

Este proyecto convierte el backend de Express a **PHP con Laravel 13**. Conserva el flujo del formulario web y las rutas `GET /` y `POST /api/reservas`. La fecha de la reserva queda pendiente de confirmación por el equipo.

## Cambio rápido en GitHub y Render

1. **GitHub.** En [el repositorio de Quincho Paraíso](https://github.com/ricaeze1-create/quincho-paraiso), creá la rama `laravel-backend` a partir de `main`. Elegí esa rama y, desde la raíz del repositorio, subí la carpeta `backend` del ZIP con **Add file → Upload files**. Confirmá que se vea `backend/Dockerfile` y no una carpeta `backend/backend`. Si la carga deja los archivos de Node.js que ya estaban ahí, Docker usa el nuevo código PHP al desplegar.
2. **Render → Environment.** En el servicio actual `quincho-paraiso-backend`, verificá las variables que ya usa el proyecto: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_DESTINATION_NUMBER` y, si estaba configurada, `GRAPH_API_VERSION`. Para el formulario publicado usá `FRONTEND_ORIGIN=https://ricaeze1-create.github.io`. Agregá `APP_KEY` con la clave generada en tu computadora y elegí **Save only** para aplicar los valores en el siguiente despliegue. La configuración presupone el puerto habitual de Render, `10000`.
3. **Render → Settings → Build → Source → Edit.** Elegí el mismo repositorio, la rama `laravel-backend` y el entorno **Docker**. Verificá las tres opciones de la tabla y elegí **Deploy**. [Cambio de entorno en Render](https://render.com/docs/native-runtimes#changing-a-services-runtime)
4. **Prueba.** Abrí [la URL del backend](https://quincho-paraiso-backend.onrender.com/) y comprobá que responde con `"ok": true`. Luego enviá una consulta desde [el formulario publicado](https://ricaeze1-create.github.io/quincho-paraiso/#reservar) y revisá la recepción en WhatsApp. La URL del servicio actual ya está configurada en `docs/script.js`.

| Opción de Render | Valor |
| --- | --- |
| Root Directory | `backend` |
| Dockerfile Path | `./Dockerfile` |
| Docker Build Context Directory | `.` |

Las dos rutas de Docker son relativas a `backend`. Si el despliegue falla, podés volver a seleccionar la rama `main` con el entorno **Node**, el comando de compilación `npm install` y el comando de inicio `npm start`. [Rutas relativas en Render](https://render.com/docs/monorepo-support#root-relative-settings)

### Generar APP_KEY en Windows

Abrí **PowerShell**, pegá estas líneas y copiá el resultado completo, incluido `base64:`. Guardalo solo en **Environment** de Render.

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
"base64:" + [Convert]::ToBase64String($bytes)
```

En macOS o Linux podés usar `printf 'base64:' && openssl rand -base64 32`. Si ya instalaste el backend en tu computadora, también podés usar `php artisan key:generate --show` desde `backend`.

## De Express a Laravel

| Express | Laravel |
| --- | --- |
| `app.get('/', …)` en `Server.js` | `Route::get('/', …)` en `routes/web.php`. Devuelve un JSON con el estado del servidor. |
| `app.post('/api/reservas', …)` | `Route::post('/reservas', …)` en `routes/api.php`. Laravel antepone `/api`. |
| La función dentro de la ruta | El método `store` de `app/Http/Controllers/ReservaController.php`. Recibe, valida y procesa el formulario. |
| `fetch(…, { method: 'POST' })` | `Http::withToken(...)->post(...)`. Envía el mensaje de texto a la API de Meta. |
| Variables leídas con `process.env` | Valores de `.env`, leídos mediante `config/services.php`. |

El controlador verifica los campos requeridos y el formato de correo, fecha y cantidad. Devuelve JSON con `ok` y `mensaje`, como espera el JavaScript original. El formulario se procesa en el momento y los datos se envían a WhatsApp. Una base de datos con un modelo `Reserva` serviría para guardar cada consulta si se incorpora esa función más adelante.

## Cómo abrirlo y probarlo

1. Necesitás **PHP 8.3 o superior** y **Composer**. Abrí una terminal en la carpeta del proyecto y ejecutá `composer install`.
2. Hacé una copia de `.env.example` con el nombre `.env`. Ejecutá `php artisan key:generate` y después `php artisan serve`.
3. Abrí [http://127.0.0.1:8000](http://127.0.0.1:8000) para ver la respuesta de estado. Podés ejecutar `php artisan route:list` para ver las rutas.

### Conectar el formulario original en local

1. Cargá en el `.env` de Laravel `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` y `WHATSAPP_DESTINATION_NUMBER` con los valores de tu configuración de Meta. Mantené el token en el servidor.
2. En tu copia local del repositorio original, cambiá `API_BASE_URL` en `docs/script.js` a `http://127.0.0.1:8000`.
3. Desde la carpeta del repositorio original, en otra terminal, ejecutá `php -S 127.0.0.1:5500 -t docs`. Poné `FRONTEND_ORIGIN=http://127.0.0.1:5500` en el `.env` de Laravel y reiniciá `php artisan serve`. Abrí [http://127.0.0.1:5500](http://127.0.0.1:5500) y probá el formulario.

El frontend y el backend conservan sus responsabilidades. El navegador envía los datos a Laravel y Laravel le pide a Meta que envíe el mensaje al WhatsApp destinatario configurado.
