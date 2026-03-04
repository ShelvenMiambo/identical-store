/**
 * Sistema de Emails usando Formspree
 * Documentação: https://formspree.io/
 */

const FORMSPREE_ENDPOINT = process.env.FORMSPREE_ENDPOINT;

interface EmailData {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Envia email via Resend (principal) ou Formspree (fallback)
 */
async function sendEmail(data: EmailData): Promise<boolean> {
  try {
    // Opção 1: Resend (recomendado - 100 emails/dia grátis)
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: 'IDENTICAL <onboarding@resend.dev>',
        to: [data.to],
        subject: data.subject,
        html: data.html,
      });
      if (error) {
        console.error('❌ [Resend] Erro:', error);
        return false;
      }
      console.log('✅ [Resend] Email enviado para:', data.to);
      return true;
    }

    // Opção 2: Formspree (fallback)
    if (FORMSPREE_ENDPOINT) {
      console.log(`📧 [Formspree] Enviando para: ${data.to}`);
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: data.to,
          _replyto: data.replyTo || 'noreply@identical.co.mz',
          _subject: data.subject,
          message: data.html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ [Formspree] Erro:', error);
        return false;
      }
      console.log('✅ [Formspree] Email enviado!');
      return true;
    }

    console.warn('⚠️ [Email] Nenhum serviço de email configurado');
    return false;
  } catch (error: any) {
    console.error('❌ [Email] Erro ao enviar email:', error.message);
    return false;
  }
}

/**
 * Template de email de confirmação de pedido
 */
function emailConfirmacaoPedido(order: any, items: any[]): string {
  const itemsList = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.imagemProduto || '/placeholder.jpg'}" 
             alt="${item.nomeProduto}" 
             style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.nomeProduto}</strong><br>
        <small>Tamanho: ${item.tamanho} | Cor: ${item.cor}</small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantidade}x
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${parseFloat(item.precoProduto).toFixed(2)} MZN
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #D94A18; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        table { width: 100%; border-collapse: collapse; background: white; }
        .total { font-size: 18px; font-weight: bold; padding: 15px; background: #f5f5f5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>IDENTICAL</h1>
          <p>Be Different, Be Classic</p>
        </div>
        
        <div class="content">
          <h2>🎉 Pedido Recebido!</h2>
          <p>Olá <strong>${order.nomeCliente}</strong>,</p>
          <p>Recebemos o seu pedido e estamos a processá-lo. Aqui estão os detalhes:</p>
          
          <h3>📦 Pedido #${order.id}</h3>
          <p><strong>Status:</strong> ${order.status === 'pendente' ? '⏳ Aguardando Pagamento' : '✅ Confirmado'}</p>
          <p><strong>Data:</strong> ${new Date(order.createdAt).toLocaleString('pt-MZ')}</p>
          
          <h3>🛍️ Itens do Pedido:</h3>
          <table>
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px;">Imagem</th>
                <th style="padding: 10px; text-align: left;">Produto</th>
                <th style="padding: 10px; text-align: center;">Qtd</th>
                <th style="padding: 10px; text-align: right;">Preço</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>
          
          <div class="total">
            <p>Subtotal: ${parseFloat(order.subtotal).toFixed(2)} MZN</p>
            ${order.desconto > 0 ? `<p>Desconto: -${parseFloat(order.desconto).toFixed(2)} MZN</p>` : ''}
            <p style="font-size: 20px; color: #D94A18;">TOTAL: ${parseFloat(order.total).toFixed(2)} MZN</p>
          </div>
          
          <h3>📍 Endereço de Entrega:</h3>
          <p>
            ${order.enderecoEntrega}<br>
            ${order.cidadeEntrega}, ${order.provinciaEntrega}<br>
          </p>
          
          <h3>📞 Contacto:</h3>
          <p>
            <strong>Email:</strong> ${order.emailCliente}<br>
            <strong>Telefone:</strong> ${order.telefoneCliente}
          </p>
          
          ${order.status === 'pendente' ? `
            <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <strong>⚠️ Próximo Passo:</strong><br>
              Complete o pagamento para confirmarmos o seu pedido.
            </div>
          ` : ''}
          
          <p style="margin-top: 20px;">
            Obrigado por comprar na IDENTICAL! 🙏<br>
            <em>Streetwear moçambicano autêntico</em>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>IDENTICAL - Be Different, Be Classic</p>
          <p>Maputo, Moçambique</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Email de pagamento confirmado
 */
function emailPagamentoConfirmado(order: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Pagamento Confirmado!</h1>
        </div>
        
        <div class="content">
          <div class="success-box">
            <h2 style="margin-top: 0;">🎉 Pagamento Recebido!</h2>
            <p>Olá <strong>${order.nomeCliente}</strong>,</p>
            <p>Confirmamos o recebimento do pagamento do seu pedido <strong>#${order.id}</strong>!</p>
          </div>
          
          <p style="margin-top: 20px;">
            <strong>💰 Valor Pago:</strong> ${parseFloat(order.total).toFixed(2)} MZN
          </p>
          
          <h3>📦 Próximos Passos:</h3>
          <ol>
            <li>Estamos a preparar o seu pedido</li>
            <li>Vamos enviá-lo em breve</li>
            <li>Receberá uma notificação quando for enviado</li>
          </ol>
          
          <p style="background: #e7f3ff; padding: 15px; border-left: 4px solid #2196f3;">
            <strong>📱 Acompanhe o seu pedido:</strong><br>
            Pode ver o status do pedido a qualquer momento na sua área de conta.
          </p>
          
          <p style="margin-top: 20px;">
            Obrigado pela sua compra! 🙏<br>
            <strong>Equipa IDENTICAL</strong>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Envia email de confirmação de pedido
 */
export async function enviarEmailConfirmacaoPedido(
  order: any,
  items: any[]
): Promise<boolean> {
  return sendEmail({
    to: order.emailCliente,
    subject: `✅ Pedido #${order.id} Recebido - IDENTICAL`,
    html: emailConfirmacaoPedido(order, items),
  });
}

/**
 * Envia email de pagamento confirmado
 */
export async function enviarEmailPagamentoConfirmado(order: any): Promise<boolean> {
  return sendEmail({
    to: order.emailCliente,
    subject: `🎉 Pagamento Confirmado - Pedido #${order.id} - IDENTICAL`,
    html: emailPagamentoConfirmado(order),
  });
}

/**
 * Envia email de pedido enviado
 */
export async function enviarEmailPedidoEnviado(order: any): Promise<boolean> {
  return sendEmail({
    to: order.emailCliente,
    subject: `📦 Pedido #${order.id} Enviado - IDENTICAL`,
    html: `
      <h2>📦 Seu pedido foi enviado!</h2>
      <p>Olá ${order.nomeCliente},</p>
      <p>O seu pedido <strong>#${order.id}</strong> foi enviado e está a caminho!</p>
      <p>Valor: ${parseFloat(order.total).toFixed(2)} MZN</p>
      <p>Obrigado pela preferência!<br><strong>IDENTICAL</strong></p>
    `,
  });
}
