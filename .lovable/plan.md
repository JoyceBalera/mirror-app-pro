

# Plano: Idioma Preferido no Perfil do Usuario

## Resumo

Adicionar um campo de idioma preferido (`preferred_language`) na tabela `profiles` do banco de dados, permitindo que o admin defina o idioma ao criar/editar a usuaria. No login, o app carrega automaticamente esse idioma. A usuaria ainda pode trocar manualmente pelo seletor no header.

---

## Mudancas por Arquivo

### 1. Banco de Dados (Migration SQL)

**O que muda:** Adiciona a coluna `preferred_language` na tabela `profiles`

```sql
ALTER TABLE public.profiles 
ADD COLUMN preferred_language text DEFAULT 'pt';
```

Tambem atualiza a funcao `handle_new_user()` para aceitar o idioma dos metadados:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'pt')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

---

### 2. `src/components/CreateUserDialog.tsx`

**O que muda:** Adiciona um Select de idioma no formulario de criacao de usuario

- Novo state: `const [language, setLanguage] = useState<"pt" | "en" | "es">("pt");`
- Novo campo visual com Select (Portugues / English / Espanol)
- Envia `language` no body da chamada ao edge function

**Antes:**
```
body: { email, password, fullName, role }
```

**Depois:**
```
body: { email, password, fullName, role, language }
```

---

### 3. `supabase/functions/create-user/index.ts`

**O que muda:** Recebe e salva o idioma preferido

- Adiciona `language` na interface `CreateUserRequest`
- Passa `preferred_language` nos `user_metadata` ao criar usuario
- Apos criacao, atualiza `profiles.preferred_language` diretamente

**Linha chave adicionada:**
```typescript
// Apos criar o usuario, atualiza o idioma no perfil
await supabaseAdmin
  .from("profiles")
  .update({ preferred_language: language || 'pt' })
  .eq("id", newUser.user.id);
```

---

### 4. `src/components/EditUserDialog.tsx`

**O que muda:** Adiciona Select de idioma no formulario de edicao

- Novo state: `const [language, setLanguage] = useState(user.preferred_language || "pt");`
- Novo campo visual com Select de idioma
- Envia `language` no body da chamada ao `edit-user`
- Interface atualizada para receber `preferred_language` do usuario

---

### 5. `supabase/functions/edit-user/index.ts`

**O que muda:** Recebe e salva idioma atualizado

- Extrai `language` do body da requisicao
- Inclui `preferred_language: language` no update do profiles

**Linha chave modificada:**
```typescript
.update({ full_name: fullName, email, preferred_language: language })
```

---

### 6. `src/contexts/LanguageContext.tsx`

**O que muda:** Carrega o idioma preferido do perfil apos login

- Adiciona um `useEffect` que, quando o usuario esta autenticado, busca `profiles.preferred_language` e aplica como idioma ativo
- So aplica se o usuario ainda nao tiver feito uma troca manual na sessao

**Logica adicionada:**
```typescript
useEffect(() => {
  const loadPreferredLanguage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('id', user.id)
        .single();
      
      if (profile?.preferred_language) {
        i18n.changeLanguage(profile.preferred_language);
      }
    }
  };
  loadPreferredLanguage();
}, []);
```

---

### 7. `src/pages/admin/Dashboard.tsx`

**O que muda:** Busca e passa `preferred_language` para os componentes

- Adiciona `preferred_language` no fetch dos usuarios (ja vem do profiles)
- Passa para o `EditUserDialog` via props
- Interface `Profile` atualizada com `preferred_language?: string`

---

## Fluxo Resultante

```text
Admin cria usuario
       |
       v
Escolhe idioma (PT/EN/ES) no formulario
       |
       v
Edge function salva no profiles.preferred_language
       |
       v
Usuaria faz login
       |
       v
LanguageContext carrega preferred_language do banco
       |
       v
App inteiro muda para o idioma correto
       |
       v
Relatorios IA gerados no idioma ativo
```

---

## O que NAO muda

- O seletor de idioma no header continua funcionando normalmente
- Se a usuaria trocar manualmente, prevalece a escolha dela na sessao
- Os edge functions de analise (`analyze-personality`, `analyze-human-design`, `analyze-integrated`) continuam recebendo o idioma da mesma forma -- pelo idioma ativo no momento da geracao
- PDFs continuam usando o idioma ativo
- Nenhuma tabela nova e criada -- apenas uma coluna adicionada

---

## Resumo dos Arquivos

| Arquivo | Tipo de Mudanca |
|---------|----------------|
| Migration SQL | Nova coluna `preferred_language` + trigger atualizado |
| `CreateUserDialog.tsx` | Novo campo Select de idioma |
| `create-user/index.ts` | Recebe e salva idioma |
| `EditUserDialog.tsx` | Novo campo Select de idioma |
| `edit-user/index.ts` | Recebe e salva idioma |
| `LanguageContext.tsx` | Carrega idioma do perfil no login |
| `admin/Dashboard.tsx` | Passa `preferred_language` ao EditDialog |

**Total: 6 arquivos editados + 1 migration SQL**

