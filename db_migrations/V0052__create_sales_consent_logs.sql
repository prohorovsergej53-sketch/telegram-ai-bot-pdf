-- Create table for sales consent logs
CREATE TABLE IF NOT EXISTS t_p56134400_telegram_ai_bot_pdf.sales_consent_logs (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    tenant_name VARCHAR(255),
    tariff_id VARCHAR(50),
    consent_text TEXT NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_sales_consent_email ON t_p56134400_telegram_ai_bot_pdf.sales_consent_logs(email);
CREATE INDEX IF NOT EXISTS idx_sales_consent_created ON t_p56134400_telegram_ai_bot_pdf.sales_consent_logs(created_at DESC);