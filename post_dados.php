<?php
header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);

if (
    !isset($input["data"]) ||
    !isset($input["acao"]) ||
    !isset($input["quantidade"])
) {
    http_response_code(400);
    echo json_encode(["error" => "Dados incompletos"]);
    exit;
}

$data = $input["data"];
$acao = $input["acao"];
$quantidade = intval($input["quantidade"]);

// Supondo que o usuário já esteja autenticado no frontend e o ID seja 1
$usuario_id = 1;

$mysqli = new mysqli("localhost", "root", "", "forest_carbon_monitoring");
if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Erro de conexão com o banco"]);
    exit;
}

$stmt = $mysqli->prepare("INSERT INTO dados_florestais (data, acao, quantidade, usuario_id) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssii", $data, $acao, $quantidade, $usuario_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Erro ao inserir dados"]);
}

$stmt->close();
$mysqli->close();
