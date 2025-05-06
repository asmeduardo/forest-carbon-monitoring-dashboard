import { useState, useEffect } from "react";
import Head from "next/head";
import Header from "../components/Header";
import ForestScene from "../components/ForestScene";
import StatsCards from "../components/StatsCards";
import CO2Indicator from "../components/CO2Indicator";
import ForestChart from "../components/ForestChart";
import DataEntryForm from "../components/DataEntryForm";

export default function Home() {
  const [forestData, setForestData] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState("day");
  const [loading, setLoading] = useState(true);
  const [co2Impact, setCO2Impact] = useState(0);

  // Load data from API
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/data/get");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Process data to ensure proper types
      const processedData = data.map((item) => ({
        date: item.date,
        planted: parseInt(item.planted) || 0,
        cut: parseInt(item.cut) || 0,
      }));

      // Sort data by date
      const sortedData = [...processedData].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      setForestData(sortedData);
      calculateCO2Impact(sortedData, currentPeriod);
    } catch (error) {
      console.error("Error loading data:", error);
      alert(
        "Erro ao carregar dados do servidor. Verifique o console para mais detalhes."
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate CO2 impact based on current period
  const calculateCO2Impact = (data, period) => {
    if (!data || data.length === 0) {
      setCO2Impact(0);
      return;
    }

    const CO2_PER_TREE_PER_YEAR = 21.8; // kg CO2 absorbed per tree per year
    const CO2_LOSS_PER_CUT_TREE = 150; // kg CO2 released per cut tree

    let plantedTotal = 0;
    let cutTotal = 0;
    let periodFactor = 1; // Period factor in days

    switch (period) {
      case "day":
        if (data.length > 0) {
          const lastDay = data[data.length - 1];
          plantedTotal = lastDay.planted;
          cutTotal = lastDay.cut;
        }
        periodFactor = 1 / 365;
        break;

      case "week":
        const lastWeekData = data.slice(-7);
        plantedTotal = lastWeekData.reduce(
          (sum, item) => sum + item.planted,
          0
        );
        cutTotal = lastWeekData.reduce((sum, item) => sum + item.cut, 0);
        periodFactor = 7 / 365;
        break;

      case "month":
        const lastMonthData = data.slice(-30);
        plantedTotal = lastMonthData.reduce(
          (sum, item) => sum + item.planted,
          0
        );
        cutTotal = lastMonthData.reduce((sum, item) => sum + item.cut, 0);
        periodFactor = 30 / 365;
        break;

      case "year":
        plantedTotal = data.reduce((sum, item) => sum + item.planted, 0);
        cutTotal = data.reduce((sum, item) => sum + item.cut, 0);
        periodFactor = 1;
        break;
    }

    // CO2 impact calculation (in tons)
    const co2Absorbed =
      (plantedTotal * CO2_PER_TREE_PER_YEAR * periodFactor) / 1000;
    const co2Released = (cutTotal * CO2_LOSS_PER_CUT_TREE) / 1000;
    const impact = (co2Absorbed - co2Released).toFixed(2);

    setCO2Impact(impact);
  };

  // Load data on initial render
  useEffect(() => {
    loadData();
  }, []);

  // Update CO2 impact when period changes
  useEffect(() => {
    calculateCO2Impact(forestData, currentPeriod);
  }, [forestData, currentPeriod]);

  // Handle period change
  const handlePeriodChange = (period) => {
    setCurrentPeriod(period);
  };

  return (
    <>
      <Head>
        <title>Dashboard de Monitoramento Florestal</title>
        <meta
          name="description"
          content="Dashboard de Monitoramento Florestal"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <div className="container">
        <div className="dashboard">
          <ForestScene forestData={forestData} />

          <StatsCards forestData={forestData} currentPeriod={currentPeriod} />

          <CO2Indicator co2Impact={co2Impact} />

          <ForestChart
            forestData={forestData}
            currentPeriod={currentPeriod}
            onPeriodChange={handlePeriodChange}
          />

          <DataEntryForm onDataAdded={loadData} />
        </div>
      </div>
    </>
  );
}
