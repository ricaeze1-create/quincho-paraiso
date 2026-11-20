<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

final class ReservaController
{
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nombre' => ['required', 'string'],
            'telefono' => ['required', 'string'],
            'email' => ['required', 'email'],
            'fecha' => ['required', 'date_format:Y-m-d'],
            'cantidad' => ['required', 'integer', 'min:1'],
            'quincho' => ['required', 'string'],
            'mensaje' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'ok' => false,
                'mensaje' => 'Completá los campos obligatorios con datos válidos.',
            ], 400);
        }

        $datos = $validator->validated();
        $token = config('services.whatsapp.token');
        $idEmisor = config('services.whatsapp.phone_number_id');
        $destino = preg_replace('/\D/', '', (string) config('services.whatsapp.destination_number'));
        $version = config('services.whatsapp.graph_api_version');

        if (blank($token) || blank($idEmisor) || strlen($destino) < 10) {
            return response()->json([
                'ok' => false,
                'mensaje' => 'El servidor todavía no tiene configurada la API de WhatsApp.',
            ], 500);
        }

        $nombresQuinchos = [
            'sauce' => 'Quincho El Sauce',
            'acacias' => 'Quincho Las Acacias',
            'ombu' => 'Quincho El Ombú',
        ];
        $quincho = $nombresQuinchos[$datos['quincho']] ?? $datos['quincho'];
        $mensaje = $datos['mensaje'] ?? 'Sin mensaje adicional';

        $texto = implode("\n", [
            '*Nueva consulta de reserva*',
            '',
            "*Nombre:* {$datos['nombre']}",
            "*Teléfono:* {$datos['telefono']}",
            "*Email:* {$datos['email']}",
            "*Fecha:* {$datos['fecha']}",
            "*Personas:* {$datos['cantidad']}",
            "*Quincho:* {$quincho}",
            "*Mensaje:* {$mensaje}",
        ]);

        try {
            $respuesta = Http::withToken($token)
                ->acceptJson()
                ->timeout(15)
                ->post("https://graph.facebook.com/{$version}/{$idEmisor}/messages", [
                    'messaging_product' => 'whatsapp',
                    'recipient_type' => 'individual',
                    'to' => $destino,
                    'type' => 'text',
                    'text' => ['preview_url' => false, 'body' => $texto],
                ]);
        } catch (ConnectionException) {
            Log::error('No se pudo contactar a WhatsApp Cloud API.');

            return response()->json([
                'ok' => false,
                'mensaje' => 'No se pudo conectar con WhatsApp Cloud API en este momento.',
            ], 502);
        }

        if (! $respuesta->successful()) {
            Log::warning('WhatsApp Cloud API rechazó la consulta.', [
                'estado_http' => $respuesta->status(),
                'codigo_meta' => $respuesta->json('error.code'),
                'fbtrace_id' => $respuesta->json('error.fbtrace_id'),
            ]);

            return response()->json([
                'ok' => false,
                'mensaje' => $respuesta->json('error.message') ?? 'WhatsApp rechazó el envío.',
            ], 502);
        }

        return response()->json([
            'ok' => true,
            'mensaje' => 'Consulta enviada correctamente por WhatsApp.',
            'messageId' => $respuesta->json('messages.0.id'),
        ]);
    }
}
