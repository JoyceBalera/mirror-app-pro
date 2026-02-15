

# Corrigir Recalculação do Desenho Humano: Conversão de Timezone

## Problema

O botão "Recalcular" do Desenho Humano trata o horário de nascimento armazenado no banco como se fosse UTC, mas ele e armazenado como **horario local**. Isso causa um erro de 3 horas (no caso de Rio de Janeiro, UTC-3), resultando em posicoes planetarias incorretas e perfil errado (6/2 ao inves de 6/3).

O fluxo original do teste usa `convertLocalBirthToUTC()` com lookup de timezone correto, mas as duas funcoes de recalculo ignoram essa conversao.

## Locais Afetados

Existem **dois** pontos de recalculo com o mesmo bug:

1. **`src/pages/UserDetails.tsx`** (painel admin, linha 419) -- usa `Date.UTC(year, month-1, day, hours, minutes)` diretamente
2. **`src/pages/DesenhoHumanoResults.tsx`** (pagina do usuario, linha 364) -- usa `new Date(\`..T..Z\`)` com sufixo Z

## Solucao

Em ambos os arquivos, antes de chamar `calculateHumanDesignChart`, fazer o lookup de timezone usando as coordenadas ja salvas no banco (`birth_lat`, `birth_lon`) e converter a hora local para UTC usando `convertLocalBirthToUTC`.

### Mudancas em `src/pages/UserDetails.tsx`

- Importar `getTimezoneFromCoords` e `convertLocalBirthToUTC` de `@/utils/geocoding`
- Na funcao `handleRecalculateHD`, substituir a construcao direta de `Date.UTC` por:
  1. Buscar timezone via `getTimezoneFromCoords(lat, lon)`
  2. Converter com `convertLocalBirthToUTC(birth_date, birth_time, timezone)`
  3. Passar o resultado para `calculateHumanDesignChart`

### Mudancas em `src/pages/DesenhoHumanoResults.tsx`

- Importar `getTimezoneFromCoords` e `convertLocalBirthToUTC` de `@/utils/geocoding`
- Na funcao de recalculo, substituir `new Date(\`..T..Z\`)` por:
  1. Buscar timezone via `getTimezoneFromCoords(birth_lat, birth_lon)`
  2. Converter com `convertLocalBirthToUTC(birth_date, birth_time, timezone)`
  3. Passar o resultado para `calculateHumanDesignChart`

## Detalhes Tecnicos

```text
Fluxo Original (correto):
  birthTime "09:40" + timezone "America/Sao_Paulo"
  -> convertLocalBirthToUTC -> 12:40 UTC
  -> calculateHumanDesignChart -> Profile 6/3 ✓

Recalculo Atual (bug):
  birthTime "09:40" tratado como UTC
  -> calculateHumanDesignChart com 09:40 UTC -> Profile 6/2 ✗

Recalculo Corrigido:
  birthTime "09:40" + getTimezoneFromCoords(lat, lon)
  -> convertLocalBirthToUTC -> 12:40 UTC  
  -> calculateHumanDesignChart -> Profile 6/3 ✓
```

## Impacto

- Apos o deploy, o botao "Recalcular" no admin e na pagina de resultados do usuario vai produzir resultados corretos
- Usuarios existentes com perfis incorretos precisam clicar "Recalcular" novamente para atualizar
- A Luciana especificamente vai de 6/2 para 6/3 apos recalcular

