-- Мигрируем существующие документы в tenant_documents для tenant_id=1 (default)
INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenant_documents 
  (tenant_id, file_name, file_key, category, pages, status, uploaded_at)
SELECT 
  1 as tenant_id,
  name as file_name,
  file_key,
  COALESCE(category, 'общее') as category,
  pages,
  COALESCE(status, 'completed') as status,
  uploaded_at
FROM t_p56134400_telegram_ai_bot_pdf.documents;

-- Мигрируем существующие чанки в tenant_chunks для tenant_id=1 (default)
-- Используем соответствие старых document_id с новыми через file_key
INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenant_chunks 
  (tenant_id, document_id, chunk_text, embedding_text, chunk_index)
SELECT 
  1 as tenant_id,
  td.id as document_id,
  dc.chunk_text,
  dc.embedding_text,
  dc.chunk_index
FROM t_p56134400_telegram_ai_bot_pdf.document_chunks dc
JOIN t_p56134400_telegram_ai_bot_pdf.documents d ON dc.document_id = d.id
JOIN t_p56134400_telegram_ai_bot_pdf.tenant_documents td ON td.file_key = d.file_key AND td.tenant_id = 1;