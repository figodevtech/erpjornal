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

/** Mensagens das etapas de cadastro e confirmação do segundo fator (TOTP). */
export function traduzirErroMfa(error: SupabaseAuthErrorLike | null | undefined) {
  const code = error?.code?.toLowerCase() ?? "";
  const message = error?.message?.toLowerCase() ?? "";

  if (code === "mfa_verification_failed" || message.includes("invalid totp code")) {
    return "Código inválido. Confira se o horário do celular está automático e digite o código atual.";
  }
  if (code === "mfa_challenge_expired") {
    return "O código expirou. Digite o código que aparece agora no aplicativo.";
  }
  if (code === "mfa_totp_enroll_not_enabled" || code === "mfa_totp_verify_not_enabled") {
    return "A autenticação por aplicativo (TOTP) está desligada no Supabase. Ative em Authentication → Multi-Factor.";
  }
  if (code === "mfa_factor_not_found") {
    return "Este autenticador não existe mais. Recarregue a página e cadastre de novo.";
  }
  if (code === "mfa_factor_name_conflict") {
    return "Já existe um autenticador com este nome. Recarregue a página e tente de novo.";
  }
  if (code === "over_request_rate_limit" || error?.status === 429) {
    return "Muitas tentativas seguidas. Aguarde um minuto e tente de novo.";
  }
  return error?.message ? `Não foi possível concluir: ${error.message}` : "Não foi possível concluir agora.";
}
