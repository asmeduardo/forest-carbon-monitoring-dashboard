import { useEffect, useState } from "react";

// Constants for CO2 calculation
const CO2_PER_TREE_PER_YEAR = 21.8; // kg of CO2 absorbed per tree per year
const CO2_LOSS_PER_CUT_TREE = 150; // kg of CO2 released per cut tree

export default function StatsCards({ forestData, currentPeriod }) {
  const [stats, setStats] = useState({
    plantedTotal: 0,
    cutTotal: 0,
    balance: 0,
    co2Impact: 0,
  });

  useEffect(() => {
    if (!forestData || forestData.length === 0) return;

    let plantedTotal = 0;
    let cutTotal = 0;
    let period = 1; // Period factor in days

    switch (currentPeriod) {
      case "day":
        // Data from last day
        if (forestData.length > 0) {
          const lastDay = forestData[forestData.length - 1];
          plantedTotal = lastDay.planted;
          cutTotal = lastDay.cut;
        }
        period = 1;
        break;

      case "week":
        // Data from last week (7 days)
        const lastWeekData = forestData.slice(-7);
        plantedTotal = lastWeekData.reduce(
          (sum, item) => sum + item.planted,
          0
        );
        cutTotal = lastWeekData.reduce((sum, item) => sum + item.cut, 0);
        period = 7;
        break;

      case "month":
        // Data from last month (30 days)
        const lastMonthData = forestData.slice(-30);
        plantedTotal = lastMonthData.reduce(
          (sum, item) => sum + item.planted,
          0
        );
        cutTotal = lastMonthData.reduce((sum, item) => sum + item.cut, 0);
        period = 30;
        break;

      case "year":
        // Data from last year (considering all data)
        plantedTotal = forestData.reduce((sum, item) => sum + item.planted, 0);
        cutTotal = forestData.reduce((sum, item) => sum + item.cut, 0);
        period = 365;
        break;
    }

    const balance = plantedTotal - cutTotal;

    // Calculate CO2 footprint
    const periodFactor = period / 365; // Fraction of the year
    const co2Absorbed =
      (plantedTotal * CO2_PER_TREE_PER_YEAR * periodFactor) / 1000; // in tons
    const co2Released = (cutTotal * CO2_LOSS_PER_CUT_TREE) / 1000; // in tons
    const co2Impact = (co2Absorbed - co2Released).toFixed(2);

    setStats({
      plantedTotal,
      cutTotal,
      balance,
      co2Impact,
    });
  }, [forestData, currentPeriod]);

  return (
    <div className="stats-container">
      <div className="stat-card planted">
        <div className="stat-label">Árvores Plantadas</div>
        <div className="stat-value" id="plantedValue">
          {stats.plantedTotal}
        </div>
        <div className="stat-label">no período selecionado</div>
      </div>
      <div className="stat-card cut">
        <div className="stat-label">Árvores Suprimidas</div>
        <div className="stat-value" id="cutValue">
          {stats.cutTotal}
        </div>
        <div className="stat-label">no período selecionado</div>
      </div>
      <div className="stat-card balance">
        <div className="stat-label">Balanço</div>
        <div className="stat-value" id="balanceValue">
          {stats.balance}
        </div>
        <div className="stat-label">no período selecionado</div>
      </div>
      <div className="stat-card co2">
        <div className="stat-label">Pegada de CO₂</div>
        <div className="stat-value" id="co2Value">
          {stats.co2Impact}
        </div>
        <div className="stat-label">toneladas no período</div>
      </div>
    </div>
  );
}
