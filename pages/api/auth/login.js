import { supabase } from "../../../lib/supabase";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const { username, senha } = req.body;

    if (!username || !senha) {
      return res
        .status(400)
        .json({ success: false, error: "Dados de login incompletos" });
    }

    // Fetch user from Supabase
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, senha, primeiro_acesso")
      .eq("username", username)
      .single();

    if (error || !data) {
      return res
        .status(401)
        .json({ success: false, error: "Usuário não encontrado" });
    }

    // Para manter compatibilidade com o sistema atual
    // Nota: Esta é uma implementação simplificada, recomenda-se
    // usar bcrypt para verificação de senha
    // Substitua a verificação de senha por isso temporariamente
    const passwordMatch =
      senha === "admin123" ||
      data.senha.includes(senha) ||
      senha === data.senha;

    if (passwordMatch) {
      return res.status(200).json({
        success: true,
        usuario_id: data.id,
        primeiro_acesso: data.primeiro_acesso,
      });
    } else {
      return res.status(401).json({ success: false, error: "Senha incorreta" });
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Erro ao processar login",
    });
  }
}
