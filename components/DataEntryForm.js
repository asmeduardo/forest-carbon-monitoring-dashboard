import { useState, useEffect } from "react";

// Constants for CO2 calculation
const CO2_PER_TREE_PER_YEAR = 21.8; // kg of CO2 absorbed per tree per year
const CO2_LOSS_PER_CUT_TREE = 150; // kg of CO2 released per cut tree

export default function DataEntryForm({ onDataAdded }) {
  const [date, setDate] = useState("");
  const [action, setAction] = useState("planted");
  const [quantity, setQuantity] = useState(1);
  const [co2Estimate, setCO2Estimate] = useState("0");
  const [co2Color, setCO2Color] = useState("#2e7d32");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem("auth") === "true";
    setIsLoggedIn(loggedIn);

    // Set today's date by default
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  // Update CO2 estimate based on action and quantity
  useEffect(() => {
    let co2Impact = 0;

    if (action === "planted") {
      co2Impact = (quantity * CO2_PER_TREE_PER_YEAR).toFixed(1);
      setCO2Estimate(`+${co2Impact}`);
      setCO2Color("#2e7d32");
    } else {
      co2Impact = (quantity * CO2_LOSS_PER_CUT_TREE).toFixed(1);
      setCO2Estimate(`-${co2Impact}`);
      setCO2Color("#c62828");
    }
  }, [action, quantity]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!date || !action || !quantity || quantity < 1) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }

    try {
      const response = await fetch("/api/data/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          action,
          quantity: parseInt(quantity),
          usuario_id: localStorage.getItem("usuario_id") || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Reset form after successful submission
        setAction("planted");
        setQuantity(1);
        alert("Dados cadastrados com sucesso!");

        // Notify parent component to reload data
        if (onDataAdded) onDataAdded();
      } else {
        alert(
          "Erro ao cadastrar dados: " + (result.error || "Erro desconhecido")
        );
      }
    } catch (error) {
      console.error("Erro ao cadastrar dados:", error);
      alert("Erro ao enviar dados para o servidor");
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="data-entry">
      <h2>Cadastro de Dados</h2>
      <form id="forestDataForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date">Data:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="action">Ação:</label>
          <select
            id="action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            required
          >
            <option value="planted">Árvores Plantadas</option>
            <option value="cut">Árvores Suprimidas</option>
          </select>
        </div>
        <div id="co2InfoContainer" className="form-group">
          <p id="co2EstimateInfo" className="co2-info">
            Impacto estimado:{" "}
            <span id="co2Estimate" style={{ color: co2Color }}>
              {co2Estimate}
            </span>{" "}
            kg de CO₂
          </p>
        </div>
        <div className="form-group">
          <label htmlFor="quantity">Quantidade:</label>
          <input
            type="number"
            id="quantity"
            min="1"
            value={quantity}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || value === null) {
                setQuantity("");
              } else {
                setQuantity(parseInt(value) || 1);
              }
            }}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Cadastrar
        </button>
      </form>
    </div>
  );
}
