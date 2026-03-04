/**
 * Integração com PaySuite API
 * Documentação: https://docs.paysuite.co.mz
 */

interface PaySuitePaymentRequest {
    amount: number;
    reference: string;
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    callback_url?: string;
    return_url?: string;
    description?: string;
}

interface PaySuitePaymentResponse {
    success: boolean;
    payment_id?: string;
    checkout_url?: string;
    reference?: string;
    message?: string;
    error?: string;
}

const PAYSUITE_TOKEN = process.env.PAYSUITE_TOKEN;
const PAYSUITE_BASE_URL = process.env.PAYSUITE_BASE_URL || 'https://api.paysuite.co.mz';

/**
 * Cria um pagamento no PaySuite
 */
export async function createPaySuitePayment(
    data: PaySuitePaymentRequest
): Promise<PaySuitePaymentResponse> {
    try {
        if (!PAYSUITE_TOKEN) {
            throw new Error('PAYSUITE_TOKEN não configurado nas variáveis de ambiente');
        }

        console.log('🔄 [PaySuite] Criando pagamento:', {
            amount: data.amount,
            reference: data.reference,
            customer: data.customer_name,
        });

        const response = await fetch(`${PAYSUITE_BASE_URL}/api/v1/payments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PAYSUITE_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                amount: data.amount,
                currency: 'MZN',
                reference: data.reference,
                customer: {
                    name: data.customer_name,
                    email: data.customer_email,
                    phone: data.customer_phone,
                },
                callback_url: data.callback_url,
                return_url: data.return_url,
                description: data.description || `Pedido IDENTICAL #${data.reference}`,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('❌ [PaySuite] Erro na API:', result);
            return {
                success: false,
                error: result.message || 'Erro ao processar pagamento',
                message: result.message,
            };
        }

        console.log('✅ [PaySuite] Pagamento criado com sucesso:', result);

        return {
            success: true,
            payment_id: result.id || result.payment_id,
            checkout_url: result.checkout_url || result.payment_url,
            reference: data.reference,
            message: 'Pagamento criado com sucesso',
        };
    } catch (error: any) {
        console.error('❌ [PaySuite] Erro ao criar pagamento:', error);
        return {
            success: false,
            error: error.message || 'Erro de conexão com PaySuite',
            message: error.message,
        };
    }
}

/**
 * Verifica o status de um pagamento
 */
export async function getPaySuitePaymentStatus(
    paymentId: string
): Promise<{ status: string; paid: boolean }> {
    try {
        if (!PAYSUITE_TOKEN) {
            throw new Error('PAYSUITE_TOKEN não configurado');
        }

        const response = await fetch(`${PAYSUITE_BASE_URL}/api/v1/payments/${paymentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${PAYSUITE_TOKEN}`,
                'Accept': 'application/json',
            },
        });

        const result = await response.json();

        return {
            status: result.status || 'unknown',
            paid: result.status === 'completed' || result.paid === true,
        };
    } catch (error: any) {
        console.error('❌ [PaySuite] Erro ao verificar status:', error);
        return {
            status: 'error',
            paid: false,
        };
    }
}

/**
 * Verifica a assinatura do webhook do PaySuite
 */
export function verifyPaySuiteWebhook(
    signature: string,
    payload: string
): boolean {
    // TODO: Implementar verificação de assinatura quando disponível na documentação PaySuite
    // Por enquanto, aceita todos os webhooks
    console.log('⚠️ [PaySuite] Verificação de webhook não implementada');
    return true;
}
