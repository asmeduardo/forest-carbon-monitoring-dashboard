import { useEffect, useState } from "react";

export default function CO2Indicator({ co2Impact }) {
  const [meterStyle, setMeterStyle] = useState({
    width: "50%",
    background: "#ffeb3b",
  });

  const [statusStyle, setStatusStyle] = useState({
    text: "Impacto neutro de carbono",
    color: "#f57f17",
  });

  useEffect(() => {
    // The scale goes from -10 to +10 tons
    const maxRange = 10;
    const percentage =
      ((parseFloat(co2Impact) + maxRange) / (maxRange * 2)) * 100;

    // Limit between 0 and 100%
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    // Set color based on impact
    if (co2Impact > 0) {
      setMeterStyle({
        width: `${clampedPercentage}%`,
        background: "linear-gradient(to right, #ffeb3b, #4caf50)",
      });

      setStatusStyle({
        text: `Positivo: Absorvendo ${Math.abs(co2Impact)} toneladas de CO₂`,
        color: "#2e7d32",
      });
    } else if (co2Impact < 0) {
      setMeterStyle({
        width: `${clampedPercentage}%`,
        background: "linear-gradient(to right, #f44336, #ffeb3b)",
      });

      setStatusStyle({
        text: `Negativo: Liberando ${Math.abs(co2Impact)} toneladas de CO₂`,
        color: "#c62828",
      });
    } else {
      setMeterStyle({
        width: "50%",
        background: "#ffeb3b",
      });

      setStatusStyle({
        text: "Impacto neutro de carbono",
        color: "#f57f17",
      });
    }
  }, [co2Impact]);

  return (
    <div className="co2-indicator">
      <h3>Impacto Ambiental - Pegada de Carbono</h3>
      <div className="co2-meter">
        <div
          className="co2-meter-fill"
          id="co2MeterFill"
          style={meterStyle}
        ></div>
        <div
          className="co2-meter-marker"
          id="co2Neutral"
          style={{ left: "50%" }}
        ></div>
      </div>
      <div id="co2Status" style={{ color: statusStyle.color }}>
        {statusStyle.text}
      </div>
    </div>
  );
}
