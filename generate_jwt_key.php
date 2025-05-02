<?php

/**
 * Gerador de chave JWT para o terminal
 * 
 * Use: php generate_jwt_key.php
 */

// Método 1: Usando random_bytes (recomendado para PHP 7+)
$length = 32; // 256 bits (recomendado para HS256)
try {
    $randomBytes = random_bytes($length);
    $jwt_secret = bin2hex($randomBytes);

    echo "==== NOVA CHAVE JWT ====\n";
    echo $jwt_secret . "\n";
    echo "========================\n";
    echo "Copie esta chave para o campo 'jwt_secret' no seu arquivo config.php\n";
} catch (Exception $e) {
    // Método alternativo usando openssl se random_bytes não estiver disponível
    $randomBytes = openssl_random_pseudo_bytes($length);
    $jwt_secret = bin2hex($randomBytes);

    echo "==== NOVA CHAVE JWT (fallback) ====\n";
    echo $jwt_secret . "\n";
    echo "==================================\n";
    echo "Copie esta chave para o campo 'jwt_secret' no seu arquivo config.php\n";
}
