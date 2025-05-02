<?php

namespace ForestMonitoring\Utilities;

class ApiResponse
{
    public static function success($data = null, $message = null, $statusCode = 200)
    {
        http_response_code($statusCode);
        return [
            'success' => true,
            'data' => $data,
            'message' => $message
        ];
    }

    public static function error($message, $statusCode = 400, $errors = null)
    {
        http_response_code($statusCode);
        return [
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ];
    }
}
