<?php
// src/Models/ForestData.php

namespace ForestMonitoring\Models;

/**
 * Forest data model class
 */
class ForestData
{
    private ?int $id = null;
    private string $date;
    private string $action; // 'planted' or 'cut'
    private int $quantity;
    private int $userId;
    private ?string $createdAt = null;

    /**
     * Constructor
     */
    public function __construct(
        string $date,
        string $action,
        int $quantity,
        int $userId,
        ?int $id = null,
        ?string $createdAt = null
    ) {
        $this->id = $id;
        $this->date = $date;
        $this->action = $action;
        $this->quantity = $quantity;
        $this->userId = $userId;
        $this->createdAt = $createdAt;
    }

    /**
     * Create forest data from database array
     */
    public static function fromArray(array $data): self
    {
        return new self(
            $data['data'],
            $data['acao'],
            (int)$data['quantidade'],
            (int)$data['usuario_id'],
            $data['id'] ?? null,
            $data['created_at'] ?? null
        );
    }

    /**
     * Convert to array for database
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'data' => $this->date,
            'acao' => $this->action,
            'quantidade' => $this->quantity,
            'usuario_id' => $this->userId,
            'created_at' => $this->createdAt
        ];
    }

    /**
     * Format for API response
     */
    public function toApiFormat(): array
    {
        return [
            'date' => $this->date,
            'planted' => $this->action === 'planted' ? $this->quantity : 0,
            'cut' => $this->action === 'cut' ? $this->quantity : 0,
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

    public function getDate(): string
    {
        return $this->date;
    }

    public function setDate(string $date): self
    {
        $this->date = $date;
        return $this;
    }

    public function getAction(): string
    {
        return $this->action;
    }

    public function setAction(string $action): self
    {
        if (!in_array($action, ['planted', 'cut'])) {
            throw new \InvalidArgumentException("Action must be 'planted' or 'cut'");
        }
        $this->action = $action;
        return $this;
    }

    public function getQuantity(): int
    {
        return $this->quantity;
    }

    public function setQuantity(int $quantity): self
    {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException("Quantity must be greater than zero");
        }
        $this->quantity = $quantity;
        return $this;
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function setUserId(int $userId): self
    {
        $this->userId = $userId;
        return $this;
    }

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }
}
