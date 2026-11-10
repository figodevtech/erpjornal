import { describe, expect, it } from "vitest";

import {
  formatarData,
  formatarDataHora,
  formatarHora,
  inicioDoDiaEmBrasilia,
  lerDataHoraLocal,
  paraDataHoraLocal,
} from "../datas";

describe("lerDataHoraLocal", () => {
  it("interpreta o valor do datetime-local como horário de Brasília", () => {
    expect(lerDataHoraLocal("2026-11-10T14:00")?.toISOString()).toBe("2026-11-10T17:00:00.000Z");
    expect(lerDataHoraLocal("2026-11-10T14:00:30")?.toISOString()).toBe("2026-11-10T17:00:30.000Z");
  });

  it("vira o dia corretamente perto da meia-noite", () => {
    expect(lerDataHoraLocal("2026-12-31T23:30")?.toISOString()).toBe("2027-01-01T02:30:00.000Z");
  });

  it("respeita o antigo horário de verão (UTC-2)", () => {
    expect(lerDataHoraLocal("2018-12-01T12:00")?.toISOString()).toBe("2018-12-01T14:00:00.000Z");
  });

  it("respeita um ISO que já traz o fuso", () => {
    expect(lerDataHoraLocal("2026-11-10T17:00:00.000Z")?.toISOString()).toBe("2026-11-10T17:00:00.000Z");
    expect(lerDataHoraLocal("2026-11-10T14:00-03:00")?.toISOString()).toBe("2026-11-10T17:00:00.000Z");
  });

  it("recusa valores vazios ou inválidos", () => {
    expect(lerDataHoraLocal(null)).toBeNull();
    expect(lerDataHoraLocal("")).toBeNull();
    expect(lerDataHoraLocal("amanhã")).toBeNull();
    expect(lerDataHoraLocal("2026-02-30T10:00")).toBeNull();
    expect(lerDataHoraLocal("2026-11-10")).toBeNull();
  });
});

describe("paraDataHoraLocal", () => {
  it("devolve o relógio de Brasília no formato do input", () => {
    expect(paraDataHoraLocal(new Date("2026-11-10T17:00:00Z"))).toBe("2026-11-10T14:00");
    expect(paraDataHoraLocal("2027-01-01T02:30:00Z")).toBe("2026-12-31T23:30");
  });

  it("faz o caminho de ida e volta sem deslocar a hora", () => {
    const valor = "2026-07-15T08:45";
    expect(paraDataHoraLocal(lerDataHoraLocal(valor))).toBe(valor);
  });

  it("devolve vazio sem data", () => {
    expect(paraDataHoraLocal(null)).toBe("");
    expect(paraDataHoraLocal(undefined)).toBe("");
    expect(paraDataHoraLocal("invalida")).toBe("");
  });
});

describe("formatação no fuso de Brasília", () => {
  // 01:30 UTC do dia 11 = 22:30 do dia 10 em Brasília.
  const quaseMeiaNoite = new Date("2026-11-11T01:30:00Z");

  it("formata data e hora pelo relógio de Brasília, não pelo do servidor", () => {
    expect(formatarData(quaseMeiaNoite)).toBe("10/11/2026");
    expect(formatarHora(quaseMeiaNoite)).toBe("22:30");
    expect(formatarDataHora(quaseMeiaNoite)).toContain("10/11/2026");
    expect(formatarDataHora(quaseMeiaNoite)).toContain("22:30");
  });

  it("aceita opções de formato", () => {
    expect(formatarData(quaseMeiaNoite, { day: "2-digit", month: "long", year: "numeric" })).toBe(
      "10 de novembro de 2026"
    );
  });

  it("calcula o início do dia em Brasília", () => {
    expect(inicioDoDiaEmBrasilia(quaseMeiaNoite).toISOString()).toBe("2026-11-10T03:00:00.000Z");
  });
});
