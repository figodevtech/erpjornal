# Search System Overhaul

## Goal
Implementar um sistema de busca editorial completo (Header, Autocomplete, Filtros, Resultados) focado em performance, acessibilidade e relevância jornalística na Revista Gestão.

## Tasks
- [ ] **Task 1: Foundation (Database & Search Logic)**
    - Implementar `src/lib/services/search-service.ts` usando Prisma Query.
    - Suporte a busca em: Articles, Categories, Users (Autores), PodcastEpisodes, ShortVideos e Politicians.
    - Lógica de Ranking: Título 3x, Tags/Destaque 2x, Conteúdo 1x + Boost Frescor 20% p/ <48h.
    - → Verify: Testes unitários p/ busca por palavra-chave e aspas.
- [ ] **Task 2: Componentes Atômicos de UI**
    - Criar `src/components/search/SearchSuggestions.tsx` (agrupamento por Assuntos/Notícias/Autores).
    - Criar `src/components/search/RecentSearches.tsx` e `TrendingSearches.tsx`.
    - → Verify: Visualizar lista de sugestões ao focar no input.
- [ ] **Task 3: SearchInput & Autocomplete**
    - Refatorar `src/components/layout/SearchBar.tsx` para usar o novo `SearchInput` com `aria-attributes` e debounce (300ms).
    - Adicionar suporte a navegação por teclado (setas up/down) e `Esc`.
    - → Verify: Navegação entre sugestões via teclado funcionando.
- [ ] **Task 4: Página de Resultados & Filtros**
    - Criar `src/app/busca/page.tsx` com `SearchFilters` e `SearchResultsList`.
    - Implementar ordenação (Mais Relevantes vs Mais Recentes).
    - → Verify: Filtros por editoria e data atualizando a URL e resultados.
- [ ] **Task 5: Mobile UX & Refinamento**
    - Implementar `SearchModal` (full-screen modal) p/ Mobile.
    - → Verify: Layout responsivo 375px (bottom sheet/drawer filtros) e 1440px.
- [ ] **Task 6: Performance & Acessibilidade**
    - Validar performance (AbortController p/ cancelar requests anteriores).
    - Auditoria final de Acessibilidade (AA).
    - → Verify: Rodar `ux_audit.py` e `accessibility_checker.py`.

## Done When
- [ ] Busca funciona com autocomplete em tempo real e grupos claros (Assuntos, Notícias, Autores).
- [ ] Página de resultados permite filtrar por editoria, data e autor.
- [ ] Ranking prioriza notícias recentes (boost de frescor).
- [ ] 100% navegável por teclado e compatível com leitores de tela.

## Notes
- Usar `sessionStorage` para buscas recentes.
- Mobile: Ocupar toda a tela ao focar na busca no header.
- Manter o estilo "Journalistic Sóbrio" (Neutral Gray, High-Contrast Red p/ destaques).
