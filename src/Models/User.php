<?php
// src/Models/User.php

namespace ForestMonitoring\Models;

/**
 * User model class
 */
class User
{
    private ?int $id = null;
    private string $username;
    private string $passwordHash;
    private bool $firstLogin;
    private ?string $createdAt = null;
    private ?string $updatedAt = null;

    /**
     * Constructor
     */
    public function __construct(
        string $username = '',
        string $passwordHash = '',
        bool $firstLogin = true,
        ?int $id = null,
        ?string $createdAt = null,
        ?string $updatedAt = null
    ) {
        $this->id = $id;
        $this->username = $username;
        $this->passwordHash = $passwordHash;
        $this->firstLogin = $firstLogin;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
    }

    /**
     * Create user from database array
     */
    public static function fromArray(array $data): self
    {
        return new self(
            $data['username'],
            $data['senha_hash'],
            (bool)$data['primeiro_acesso'],
            $data['id'],
            $data['created_at'] ?? null,
            $data['updated_at'] ?? null
        );
    }

    /**
     * Convert to array
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'senha_hash' => $this->passwordHash,
            'primeiro_acesso' => $this->firstLogin ? 1 : 0,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt
        ];
    }

    // Getters and Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): self
    {
        $this->id = $id;
        return $this;
    }

    public function getUsername(): string
    {
        return $this->username;
    }

    public function setUsername(string $username): self
    {
        $this->username = $username;
        return $this;
    }

    public function getPasswordHash(): string
    {
        return $this->passwordHash;
    }

    public function setPasswordHash(string $passwordHash): self
    {
        $this->passwordHash = $passwordHash;
        return $this;
    }

    public function isFirstLogin(): bool
    {
        return $this->firstLogin;
    }

    public function setFirstLogin(bool $firstLogin): self
    {
        $this->firstLogin = $firstLogin;
        return $this;
    }

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?string
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(string $updatedAt): self
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
}
