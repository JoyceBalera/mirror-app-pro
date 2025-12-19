-- Passo 1: Remover duplicatas mantendo apenas a resposta mais recente
DELETE FROM test_answers a
USING test_answers b
WHERE a.session_id = b.session_id 
  AND a.question_id = b.question_id
  AND a.answered_at < b.answered_at;

-- Passo 2: Criar constraint UNIQUE para impedir novas duplicatas
ALTER TABLE test_answers 
ADD CONSTRAINT test_answers_session_question_unique 
UNIQUE (session_id, question_id);