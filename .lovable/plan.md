

## Corrigir horario de nascimento da Jessica Borges

### O que sera feito

1. **Atualizar o horario de nascimento** no banco de dados de `12:27` para `17:55`
2. **Recalcular o mapa de Arquitetura Pessoal** com o horario correto (isso muda tipo energetico, perfil, autoridade, canais, portas, etc.)
3. **Gerar novo relatorio de IA** com os dados recalculados

### Detalhes Tecnicos

**Passo 1**: Usar o insert tool para executar um UPDATE na tabela `human_design_results` alterando `birth_time` de `12:27:00` para `17:55:00` para o registro `id = 6ce60586-4c1d-4f57-9562-18efbf57e45b`

**Passo 2**: Acessar a pagina de detalhes da Jessica no admin (`/admin/user/758045ef-...`) e usar o botao "Recalcular HD" que ja existe na interface -- OU -- executar a recalculacao via codigo diretamente (chamando `calculateHumanDesignChart` com a data `1991-02-08`, hora `17:55`, coordenadas `-20.43, -47.83` de Guara-SP, convertendo para UTC com timezone correto)

**Passo 3**: Apos recalculo, gerar nova analise de IA chamando a edge function `analyze-human-design`

> O resultado final tera tipo energetico, perfil, autoridade, canais e portas diferentes do atual, pois a mudanca de horario (12:27 para 17:55) altera significativamente as posicoes planetarias.

