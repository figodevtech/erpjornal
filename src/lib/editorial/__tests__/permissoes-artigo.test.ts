import { describe, expect, it } from "vitest";

import {
  motivoBloqueioExclusao,
  motivoBloqueioMudancaStatus,
  podeAtribuirAutor,
  podeEditarArtigo,
} from "../permissoes-artigo";
import type { StatusArtigo } from "../status";

// Perfis como no seed (prisma/seed-data/acesso.ts)
const sessao = (id: string, permissoes: string[]) => ({ user: { id, permissoes } });
const reporter = sessao("rep", ["artigos:ler", "artigos:criar", "artigos:editar"]);
const juridico = sessao("jur", ["artigos:ler", "artigos:editar", "artigos:editar_todos"]);
const editor = sessao("ed", ["artigos:ler", "artigos:criar", "artigos:editar", "artigos:editar_todos", "artigos:publicar"]);

const artigoDe = (autorId: string, status: StatusArtigo = "redacao") => ({ autorId, status });

describe("podeEditarArtigo", () => {
  it("repórter edita o próprio artigo, mas não o de outra pessoa", () => {
    expect(podeEditarArtigo(reporter, artigoDe("rep"))).toBe(true);
    expect(podeEditarArtigo(reporter, artigoDe("outro"))).toBe(false);
  });

  it("editar_todos edita qualquer artigo", () => {
    expect(podeEditarArtigo(juridico, artigoDe("outro"))).toBe(true);
    expect(podeEditarArtigo(editor, artigoDe("outro"))).toBe(true);
  });
});

describe("motivoBloqueioMudancaStatus (Kanban)", () => {
  it("repórter NÃO move artigo de outra pessoa (antes podia)", () => {
    expect(motivoBloqueioMudancaStatus(reporter, artigoDe("outro", "pauta"), "revisao")).not.toBeNull();
  });

  it("repórter NÃO despublica artigo publicado, nem o próprio (antes podia)", () => {
    expect(motivoBloqueioMudancaStatus(reporter, artigoDe("rep", "publicado"), "pauta")).not.toBeNull();
  });

  it("repórter não publica nem arquiva", () => {
    expect(motivoBloqueioMudancaStatus(reporter, artigoDe("rep", "revisao"), "publicado")).not.toBeNull();
    expect(motivoBloqueioMudancaStatus(reporter, artigoDe("rep", "revisao"), "arquivado")).not.toBeNull();
  });

  it("repórter move o próprio artigo entre etapas anteriores à publicação", () => {
    expect(motivoBloqueioMudancaStatus(reporter, artigoDe("rep", "pauta"), "revisao")).toBeNull();
  });

  it("jurídico move artigos de qualquer autor, mas não publica", () => {
    expect(motivoBloqueioMudancaStatus(juridico, artigoDe("outro", "revisao"), "juridico")).toBeNull();
    expect(motivoBloqueioMudancaStatus(juridico, artigoDe("outro", "juridico"), "publicado")).not.toBeNull();
  });

  it("editor publica e despublica qualquer artigo", () => {
    expect(motivoBloqueioMudancaStatus(editor, artigoDe("outro", "revisao"), "publicado")).toBeNull();
    expect(motivoBloqueioMudancaStatus(editor, artigoDe("outro", "publicado"), "revisao")).toBeNull();
  });
});

describe("podeAtribuirAutor", () => {
  it("só editar_todos troca o autor (repórter não pode se apropriar de artigos)", () => {
    expect(podeAtribuirAutor(reporter)).toBe(false);
    expect(podeAtribuirAutor(editor)).toBe(true);
  });
});

describe("motivoBloqueioExclusao", () => {
  it("repórter exclui o próprio rascunho, mas não um publicado nem o de outra pessoa", () => {
    expect(motivoBloqueioExclusao(reporter, artigoDe("rep", "pauta"))).toBeNull();
    expect(motivoBloqueioExclusao(reporter, artigoDe("rep", "publicado"))).not.toBeNull();
    expect(motivoBloqueioExclusao(reporter, artigoDe("outro", "pauta"))).not.toBeNull();
  });

  it("editor exclui artigo publicado", () => {
    expect(motivoBloqueioExclusao(editor, artigoDe("outro", "publicado"))).toBeNull();
  });
});
