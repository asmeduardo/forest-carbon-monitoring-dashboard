import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem("auth") === "true";
    if (loggedIn) {
      const storedUsername = localStorage.getItem("username") || "Usuário";
      setIsLoggedIn(true);
      setUsername(storedUsername);
      setUserId(localStorage.getItem("usuario_id"));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, senha: password }),
      });

      const result = await response.json();

      if (result.success) {
        if (result.primeiro_acesso === 1) {
          setUserId(result.usuario_id);
          setShowResetPassword(true);
        } else {
          localStorage.setItem("auth", "true");
          localStorage.setItem("username", username);
          localStorage.setItem("usuario_id", result.usuario_id);
          setIsLoggedIn(true);
          // Refresh the page to update components that depend on authentication
          router.reload();
        }
      } else {
        alert(result.error || "Erro no login");
      }
    } catch (error) {
      console.error("Erro durante o login:", error);
      alert("Erro de conexão ao tentar fazer login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("username");
    localStorage.removeItem("usuario_id");
    setIsLoggedIn(false);
    // Refresh the page to update components that depend on authentication
    router.reload();
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      alert("Digite a nova senha");
      return;
    }

    try {
      const response = await fetch("/api/auth/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: userId,
          nova_senha: newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Senha atualizada com sucesso!");
        setShowResetPassword(false);

        // Login automatically after password reset
        localStorage.setItem("auth", "true");
        localStorage.setItem("username", username);
        localStorage.setItem("usuario_id", userId);
        setIsLoggedIn(true);

        // Refresh the page to update components that depend on authentication
        router.reload();
      } else {
        alert(result.error || "Erro ao redefinir senha");
      }
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      alert("Erro de conexão ao tentar redefinir a senha");
    }
  };

  return (
    <header>
      <div className="header-container">
        <h1>Dashboard de Monitoramento Florestal</h1>

        {!isLoggedIn ? (
          <div id="loginFormContainer">
            <form id="loginForm" onSubmit={handleLogin}>
              <input
                type="text"
                name="username"
                id="username"
                placeholder="Usuário"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="password"
                name="senha"
                id="password"
                placeholder="Senha"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Login
              </button>
            </form>
          </div>
        ) : (
          <div id="logoutSection" style={{ display: "flex" }}>
            <span id="welcomeUser">Bem-vindo, {username}</span>
            <button id="logoutBtn" className="btn" onClick={handleLogout}>
              Sair
            </button>
          </div>
        )}
      </div>

      {showResetPassword && (
        <div className="senha-reset-container" style={{ display: "block" }}>
          <h3>Redefinir senha</h3>
          <input
            type="password"
            id="novaSenha"
            placeholder="Nova senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <br />
          <br />
          <button onClick={handleResetPassword}>Salvar</button>
        </div>
      )}
    </header>
  );
}
