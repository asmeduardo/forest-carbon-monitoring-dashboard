<?php
// config/config.example.php
// ATENÇÃO: Copie este arquivo para config.php e ajuste os valores conforme seu ambiente

return [
    // Database configuration
    'db_host' => 'localhost',
    'db_name' => 'your_database_name',
    'db_user' => 'your_database_user',
    'db_pass' => 'your_database_password',

    // Application settings
    'app_name' => 'Forest Carbon Monitoring',
    'app_url' => 'http://localhost/forest-carbon-monitoring',

    // Carbon calculation constants
    'co2_per_tree_per_year' => 21.8, // kg of CO2 absorbed per tree per year
    'co2_loss_per_cut_tree' => 150,  // kg of CO2 released per cut tree

    // Security
    'jwt_secret' => 'change-this-to-a-secure-random-string', // IMPORTANTE: Altere em produção!
    'token_expiry' => 86400, // Token validity in seconds (24 hours)

    // Session settings
    'session_lifetime' => 86400,
];
