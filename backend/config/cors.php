<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['POST', 'OPTIONS'],
    'allowed_origins' => [env('FRONTEND_ORIGIN', '*')],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Content-Type'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
