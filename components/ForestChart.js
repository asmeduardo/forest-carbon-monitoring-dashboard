import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

// Constants for CO2 calculation
const CO2_PER_TREE_PER_YEAR = 21.8; // kg of CO2 absorbed per tree per year
const CO2_LOSS_PER_CUT_TREE = 150; // kg of CO2 released per cut tree

export default function ForestChart({
  forestData,
  currentPeriod,
  onPeriodChange,
}) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart
    const ctx = chartRef.current.getContext("2d");

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "Árvores Plantadas",
            backgroundColor: "#4caf50",
            data: [],
          },
          {
            label: "Árvores Suprimidas",
            backgroundColor: "#ff9800",
            data: [],
          },
          {
            label: "Pegada de CO₂ (ton)",
            type: "line",
            borderColor: "#009688",
            backgroundColor: "rgba(0, 150, 136, 0.2)",
            fill: true,
            data: [],
            yAxisID: "co2",
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: false,
            title: {
              display: true,
              text: "Data",
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Quantidade",
            },
          },
          co2: {
            position: "right",
            beginAtZero: false,
            title: {
              display: true,
              text: "CO₂ (toneladas)",
            },
            grid: {
              drawOnChartArea: false,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!chartInstance.current || !forestData || forestData.length === 0)
      return;

    updateChart();
  }, [forestData, currentPeriod]);

  const updateChart = () => {
    const labels = [];
    const plantedData = [];
    const cutData = [];
    const co2Data = [];

    let processedData;

    switch (currentPeriod) {
      case "day":
        // Daily data (last 30 days)
        processedData = [...forestData].slice(-30);

        processedData.forEach((item) => {
          labels.push(formatDate(item.date));
          plantedData.push(item.planted);
          cutData.push(item.cut);

          // Calculate CO2 impact (in tons)
          const co2Absorbed =
            (item.planted * CO2_PER_TREE_PER_YEAR) / 365 / 1000; // conversion to tons
          const co2Released = (item.cut * CO2_LOSS_PER_CUT_TREE) / 1000; // conversion to tons
          const co2Impact = co2Absorbed - co2Released;
          co2Data.push(co2Impact);
        });
        break;

      case "week":
        // Group by week
        processedData = groupDataByWeek(forestData);

        processedData.forEach((item) => {
          labels.push(`Semana ${item.week}`);
          plantedData.push(item.planted);
          cutData.push(item.cut);

          // Calculate CO2 impact (in tons)
          const co2Absorbed =
            (item.planted * CO2_PER_TREE_PER_YEAR) / 52 / 1000; // conversion to tons
          const co2Released = (item.cut * CO2_LOSS_PER_CUT_TREE) / 1000; // conversion to tons
          const co2Impact = co2Absorbed - co2Released;
          co2Data.push(co2Impact);
        });
        break;

      case "month":
        // Group by month
        processedData = groupDataByMonth(forestData);

        processedData.forEach((item) => {
          labels.push(item.month);
          plantedData.push(item.planted);
          cutData.push(item.cut);

          // Calculate CO2 impact (in tons)
          const co2Absorbed =
            (item.planted * CO2_PER_TREE_PER_YEAR) / 12 / 1000; // conversion to tons
          const co2Released = (item.cut * CO2_LOSS_PER_CUT_TREE) / 1000; // conversion to tons
          const co2Impact = co2Absorbed - co2Released;
          co2Data.push(co2Impact);
        });
        break;

      case "year":
        // Group by year
        processedData = groupDataByYear(forestData);

        processedData.forEach((item) => {
          labels.push(item.year.toString());
          plantedData.push(item.planted);
          cutData.push(item.cut);

          // Calculate CO2 impact (in tons)
          const co2Absorbed = (item.planted * CO2_PER_TREE_PER_YEAR) / 1000; // conversion to tons
          const co2Released = (item.cut * CO2_LOSS_PER_CUT_TREE) / 1000; // conversion to tons
          const co2Impact = co2Absorbed - co2Released;
          co2Data.push(co2Impact);
        });
        break;
    }

    chartInstance.current.data.labels = labels;
    chartInstance.current.data.datasets[0].data = plantedData;
    chartInstance.current.data.datasets[1].data = cutData;
    chartInstance.current.data.datasets[2].data = co2Data;
    chartInstance.current.update();
  };

  // Helper functions
  function formatDate(dateString) {
    // Extrair diretamente dia e mês da string no formato 'YYYY-MM-DD'
    const parts = dateString.split("-");
    if (parts.length === 3) {
      // parts[0] = ano, parts[1] = mês, parts[2] = dia
      return `${parseInt(parts[2])}/${parseInt(parts[1])}`;
    }

    // Fallback para o método atual se o formato for diferente
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }

  function groupDataByWeek(data) {
    const weeks = {};

    data.forEach((item) => {
      const date = new Date(item.date);
      const weekOfYear = getWeekNumber(date);
      const key = `${date.getFullYear()}-${weekOfYear}`;

      if (!weeks[key]) {
        weeks[key] = {
          week: weekOfYear,
          year: date.getFullYear(),
          planted: 0,
          cut: 0,
        };
      }

      weeks[key].planted += item.planted;
      weeks[key].cut += item.cut;
    });

    return Object.values(weeks).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.week - b.week;
    });
  }

  function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  function groupDataByMonth(data) {
    const months = {};
    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    data.forEach((item) => {
      const date = new Date(item.date);
      const monthIndex = date.getMonth();
      const key = `${date.getFullYear()}-${monthIndex}`;

      if (!months[key]) {
        months[key] = {
          month: `${monthNames[monthIndex]} ${date.getFullYear()}`,
          monthIndex: monthIndex,
          year: date.getFullYear(),
          planted: 0,
          cut: 0,
        };
      }

      months[key].planted += item.planted;
      months[key].cut += item.cut;
    });

    return Object.values(months).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthIndex - b.monthIndex;
    });
  }

  function groupDataByYear(data) {
    const years = {};

    data.forEach((item) => {
      const year = new Date(item.date).getFullYear();

      if (!years[year]) {
        years[year] = {
          year: year,
          planted: 0,
          cut: 0,
        };
      }

      years[year].planted += item.planted;
      years[year].cut += item.cut;
    });

    return Object.values(years).sort((a, b) => a.year - b.year);
  }

  return (
    <div className="chart-container">
      <div className="chart-controls">
        <h2>Estatísticas de Plantio e Supressão</h2>
        <div className="time-selectors">
          <button
            className={`time-btn ${currentPeriod === "day" ? "active" : ""}`}
            data-period="day"
            onClick={() => onPeriodChange("day")}
          >
            Diário
          </button>
          <button
            className={`time-btn ${currentPeriod === "week" ? "active" : ""}`}
            data-period="week"
            onClick={() => onPeriodChange("week")}
          >
            Semanal
          </button>
          <button
            className={`time-btn ${currentPeriod === "month" ? "active" : ""}`}
            data-period="month"
            onClick={() => onPeriodChange("month")}
          >
            Mensal
          </button>
          <button
            className={`time-btn ${currentPeriod === "year" ? "active" : ""}`}
            data-period="year"
            onClick={() => onPeriodChange("year")}
          >
            Anual
          </button>
        </div>
      </div>
      <canvas id="forestChart" ref={chartRef}></canvas>
    </div>
  );
}
