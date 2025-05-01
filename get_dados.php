<?php
header("Content-Type: application/json");

$mysqli = new mysqli("localhost", "root", "", "forest_carbon_monitoring");
if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Erro ao conectar ao banco"]);
    exit;
}

$sql = "SELECT data, acao, quantidade FROM dados_florestais ORDER BY data ASC";
$result = $mysqli->query($sql);

$dados = [];
while ($row = $result->fetch_assoc()) {
    $dados[] = [
        "date" => $row["data"],
        "planted" => $row["acao"] === "planted" ? intval($row["quantidade"]) : 0,
        "cut" => $row["acao"] === "cut" ? intval($row["quantidade"]) : 0
    ];
}

$mysqli->close();

echo json_encode($dados);
