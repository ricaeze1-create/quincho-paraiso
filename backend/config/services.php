<?php

return [
    'whatsapp' => [
        'token' => env('WHATSAPP_TOKEN'),
        'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
        'destination_number' => env('WHATSAPP_DESTINATION_NUMBER'),
        'graph_api_version' => env('GRAPH_API_VERSION', 'v25.0'),
    ],
];
