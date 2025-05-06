import { supabase } from "../../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const { usuario_id, nova_senha } = req.body;

    if (!usuario_id || !nova_senha) {
      return res
        .status(400)
        .json({ success: false, error: "Dados incompletos" });
    }

    // Para fins de demonstração - em produção use bcrypt ou similar
    const senha_hash = `hashed_${nova_senha}_${Date.now()}`;

    // Update password using Supabase
    const { error } = await supabase
      .from("usuarios")
      .update({
        senha: senha_hash,
        primeiro_acesso: false,
      })
      .eq("id", parseInt(usuario_id));

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Erro ao atualizar senha",
    });
  }
}
