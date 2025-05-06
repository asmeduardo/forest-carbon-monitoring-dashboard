import { supabase } from "../../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const { date, action, quantity, usuario_id } = req.body;

    // Validate input data
    if (!date || !action || !quantity) {
      return res
        .status(400)
        .json({ success: false, error: "Dados incompletos" });
    }

    // Insert data using Supabase
    const { error } = await supabase.from("registros_arvores").insert({
      data: date,
      tipo_acao: action,
      quantidade: parseInt(quantity),
      usuario_id: usuario_id ? parseInt(usuario_id) : null,
    });

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Erro ao cadastrar dados",
    });
  }
}
