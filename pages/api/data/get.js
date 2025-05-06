import { supabase } from "../../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // SQL query usando Supabase
    const { data, error } = await supabase
      .from("registros_arvores")
      .select("data, tipo_acao, quantidade")
      .order("data");

    if (error) throw error;

    // Processar dados para o formato esperado
    const agrupados = {};
    data.forEach((item) => {
      const data = item.data;
      if (!agrupados[data]) {
        agrupados[data] = {
          date: data,
          planted: 0,
          cut: 0,
        };
      }

      if (item.tipo_acao === "planted") {
        agrupados[data].planted += item.quantidade;
      } else if (item.tipo_acao === "cut") {
        agrupados[data].cut += item.quantidade;
      }
    });

    const resultado = Object.values(agrupados);
    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Error fetching data from database" });
  }
}
