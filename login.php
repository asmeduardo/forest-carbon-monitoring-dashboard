<?php
// login.php
$host = "localhost";
$db = "forest_carbon_monitoring";
$user = "root";
$pass = "";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) die("Erro: " . $conn->connect_error);

$data = json_decode(file_get_contents("php://input"), true);
$username = $data["username"];
$senha = $data["senha"];

$stmt = $conn->prepare("SELECT senha_hash FROM usuarios WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    $stmt->bind_result($senha_hash);
    $stmt->fetch();
    if (password_verify($senha, $senha_hash)) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => "Senha incorreta"]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Usuário não encontrado"]);
}

$stmt->close();
$conn->close();
