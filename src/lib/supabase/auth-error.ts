type SupabaseAuthErrorLike = {
  message?: string;
  code?: string;
  status?: number;
};

export function traduzirErroLoginSupabase(error: SupabaseAuthErrorLike | null | undefined) {
  const message = error?.message?.toLowerCase() ?? "";
  const code = error?.code?.toLowerCase() ?? "";

  if (code.includes("email_not_confirmed") || message.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar.";
  }

  if (message.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }

  if (message.includes("user not found")) {
    return "Usuário não encontrado no Supabase Auth.";
  }

  if (message.includes("signup is disabled")) {
    return "O login por e-mail/senha não está habilitado no Supabase.";
  }

  if (message) {
    return `Erro de login: ${error?.message}`;
  }

  return "Não foi possível entrar no momento.";
}
