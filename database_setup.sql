-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS forest_carbon_monitoring;
USE forest_carbon_monitoring;

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    primeiro_acesso BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- Criar tabela de dados florestais
CREATE TABLE IF NOT EXISTS dados_florestais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data DATE NOT NULL,
    acao ENUM('planted', 'cut') NOT NULL,
    quantidade INT NOT NULL,
    usuario_id INT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Inserir usuário administrador padrão (senha: admin123)
INSERT INTO usuarios (username, senha_hash, primeiro_acesso, created_at, updated_at)
VALUES ('admin', '$2y$10$ZTFiYTYzYzVkNzE5ZGU0Z.VWfXHgcMBVG0KgURVDEMp0qpB89G5bO', 1, NOW(), NOW());