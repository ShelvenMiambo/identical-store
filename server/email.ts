import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// ── 1. Configurações de SMTP / Nodemailer ──────────────────────────────
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);

let transporter: nodemailer.Transporter | null = null;
if (smtpUser && smtpPass) {
    console.log(`✉️ [SMTP] Credenciais detetadas. Configurando Nodemailer para ${smtpHost}:${smtpPort}`);
    transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true para porta 465, false para 587 ou outras
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
        connectionTimeout: 5000, // 5 segundos de limite para conectar
        greetingTimeout: 5000,   // 5 segundos para o greeting SMTP
        socketTimeout: 5000,     // 5 segundos de inatividade do socket
    });
}

// ── 2. Configurações de Resend (como fallback ou primário) ──────────────
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev";

// ── 3. Helper de Envio Geral ───────────────────────────────────────────
interface MailOptions {
    from: string;
    to: string;
    subject: string;
    html: string;
}

async function enviarEmail(options: MailOptions) {
    let smtpError: string | null = null;

    // A. Tentar Nodemailer SMTP se estiver configurado
    if (transporter) {
        try {
            console.log(`[EMAIL] A enviar via SMTP (${smtpHost}:${smtpPort}) para: ${options.to}`);
            await transporter.sendMail({
                from: options.from,
                to: options.to,
                subject: options.subject,
                html: options.html,
            });
            console.log(`[EMAIL] Enviado com sucesso via SMTP!`);
            return { success: true, mocked: false };
        } catch (err: any) {
            console.error(`[EMAIL] Falha ao enviar via SMTP:`, err.message);
            smtpError = err.message;
            // Se falhar o SMTP, tenta o Resend em baixo se estiver disponível
        }
    }

    // B. Tentar Resend
    if (process.env.RESEND_API_KEY) {
        try {
            console.log(`[EMAIL] A enviar via Resend API para: ${options.to}`);
            const { data, error } = await resend.emails.send({
                from: options.from,
                to: [options.to],
                subject: options.subject,
                html: options.html,
            });

            if (error) {
                console.error("Erro interno do Resend:", error);
                if (error.message && error.message.includes("testing emails")) {
                    return { 
                        success: false, 
                        error: "O teu plano Resend está em modo Sandbox de testes. Só podes enviar e-mails de teste para o e-mail do proprietário da conta (identicaloficialmz@gmail.com). O link foi gerado e registado com sucesso nos logs do painel do Railway." 
                    };
                }
                return { success: false, error: error.message };
            }

            console.log("Email enviado via HTTPS (Resend) com sucesso! ID: %s", data?.id);
            return { success: true, mocked: false };
        } catch (err: any) {
            console.error("Erro ao contactar a API do Resend:", err.message);
            return { success: false, error: err.message };
        }
    }

    // C. Se tentou SMTP e falhou (e não tem Resend configurado)
    if (smtpError) {
        return { 
            success: false, 
            error: `Erro no envio via Gmail SMTP: ${smtpError}. Isto costuma dever-se ao bloqueio de portas SMTP na nuvem ou a credenciais incorretas.` 
        };
    }

    // D. Fallback para Mock se nada estiver configurado
    console.warn(`[EMAIL MOCK] Sem credenciais configuradas (SMTP ou Resend). Email simulado para ${options.to}`);
    return { success: true, mocked: true };
}

// ── 4. Funções Específicas de E-mail da App ────────────────────────────

export async function sendPasswordResetEmail(toEmail: string, resetLink: string) {
    // Sempre logar o link no console do servidor para fins de testes fáceis no Railway
    console.log(`🔑 [PASSWORD RESET] Link de recuperação gerado para ${toEmail}: ${resetLink}`);

    const fromAddress = smtpUser ? `ID≠NTICAL <${smtpUser}>` : `ID≠NTICAL Angola <${FROM_EMAIL}>`;

    return enviarEmail({
        from: fromAddress,
        to: toEmail,
        subject: "Recuperação de Password - ID≠NTICAL",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="background-color: #000; padding: 20px; text-align: center;">
                    <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 2px;">ID≠NTICAL</h1>
                </div>
                
                <div style="padding: 30px 20px; background-color: #f9f9f9;">
                    <h2 style="margin-top: 0;">Olá!</h2>
                    <p>Recebemos um pedido para alterar a palavra-passe da tua conta na ID≠NTICAL.</p>
                    <p>Se foste tu que pediste, clica no botão abaixo para escolher uma nova palavra-passe (válido por 1 hora):</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                            Escolher Nova Password
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666;">Se o botão não funcionar, copia e cola este link no teu navegador:<br>
                    <a href="${resetLink}" style="color: #000; word-break: break-all;">${resetLink}</a></p>
                    
                    <p style="font-size: 14px; color: #666; margin-top: 30px;">Se não pediste para mudar a password, apenas ignora este email. A tua conta continuará segura.</p>
                </div>
                
                <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
                    &copy; ${new Date().getFullYear()} ID≠NTICAL. Todos os direitos reservados.
                </div>
            </div>
        `,
    });
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "identicaloficialmz@gmail.com";

function getOrderHtml(order: any, items: any[], title: string, subtitle: string) {
    const formatter = new Intl.NumberFormat('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    let itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <strong>${item.nomeProduto}</strong><br>
                <small>Tamanho: ${item.tamanho} | Cor: ${item.cor}</small>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantidade}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatter.format(item.precoProduto)} MZN</td>
        </tr>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background-color: #000; padding: 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 2px;">ID≠NTICAL</h1>
            </div>
            <div style="padding: 30px 20px; background-color: #f9f9f9;">
                <h2 style="margin-top: 0;">${title}</h2>
                <p>${subtitle}</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                
                <h3>Detalhes do Pedido #${order.id.slice(0,8).toUpperCase()}</h3>
                <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
                <p><strong>Cliente:</strong> ${order.nomeCliente} (${order.emailCliente || 'Sem email'})</p>
                <p><strong>Contacto:</strong> ${order.telefoneCliente}</p>
                <p><strong>Entrega:</strong> ${order.enderecoEntrega}, ${order.cidadeEntrega}, ${order.provinciaEntrega}</p>
                <p><strong>Método de Pagamento:</strong> ${order.metodoPagamento}</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="background-color: #eee;">
                            <th style="padding: 10px; text-align: left;">Artigo</th>
                            <th style="padding: 10px; text-align: center;">Qtd</th>
                            <th style="padding: 10px; text-align: right;">Preço</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
                            <td style="padding: 10px; text-align: right;">${formatter.format(order.subtotal)} MZN</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding: 10px; text-align: right;"><strong>Desconto:</strong></td>
                            <td style="padding: 10px; text-align: right; color: green;">-${formatter.format(order.desconto || 0)} MZN</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding: 10px; text-align: right;"><strong>Total a Pagar:</strong></td>
                            <td style="padding: 10px; text-align: right; font-size: 18px;"><strong>${formatter.format(order.total)} MZN</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    `;
}

export async function enviarEmailConfirmacaoPedido(order: any, items: any[]) {
    if (!order.emailCliente) return;
    const fromAddress = smtpUser ? `ID≠NTICAL <${smtpUser}>` : `ID≠NTICAL Angola <${FROM_EMAIL}>`;

    await enviarEmail({
        from: fromAddress,
        to: order.emailCliente,
        subject: `Confirmação de Encomenda #${order.id.slice(0,8).toUpperCase()} - ID≠NTICAL`,
        html: getOrderHtml(
            order, 
            items, 
            "A tua encomenda foi recebida!", 
            "Obrigado por comprares na ID≠NTICAL. A nossa equipa irá confirmar os detalhes brevemente."
        )
    });
}

export async function enviarEmailNovoAdmin(order: any, items: any[]) {
    const fromAddress = smtpUser ? `ID≠NTICAL <${smtpUser}>` : `ID≠NTICAL Loja <${FROM_EMAIL}>`;

    await enviarEmail({
        from: fromAddress,
        to: ADMIN_EMAIL,
        subject: `[NOVA ENCOMENDA] #${order.id.slice(0,8).toUpperCase()} - ${order.nomeCliente}`,
        html: getOrderHtml(
            order, 
            items, 
            "Nova Venda na Loja!", 
            "Um cliente acabou de realizar um pedido. Lê os detalhes abaixo:"
        )
    });
}

export async function enviarEmailPagamentoConfirmado(order: any) {
    if (!order.emailCliente) return;
    const fromAddress = smtpUser ? `ID≠NTICAL <${smtpUser}>` : `ID≠NTICAL Angola <${FROM_EMAIL}>`;
    const formatter = new Intl.NumberFormat('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    await enviarEmail({
        from: fromAddress,
        to: order.emailCliente,
        subject: `Pagamento Confirmado #${order.id.slice(0, 8).toUpperCase()} - ID≠NTICAL`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="background-color: #000; padding: 20px; text-align: center;">
                    <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 2px;">ID≠NTICAL</h1>
                </div>
                <div style="padding: 30px 20px; background-color: #f9f9f9;">
                    <h2 style="margin-top: 0; color: #16a34a;">✅ Pagamento Confirmado!</h2>
                    <p>Olá <strong>${order.nomeCliente}</strong>,</p>
                    <p>O teu pagamento da encomenda <strong>#${order.id.slice(0, 8).toUpperCase()}</strong> foi confirmado com sucesso.</p>
                    <p><strong>Total pago:</strong> ${formatter.format(order.total)} MZN</p>
                    <p>A nossa equipa irá preparar o teu pedido e entregar em breve. Agradecemos a confiança!</p>
                </div>
                <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
                    &copy; ${new Date().getFullYear()} ID≠NTICAL. Todos os direitos reservados.
                </div>
            </div>
        `,
    });
}

export async function enviarEmailComprovanteAdmin(order: any, items: any[], comprovanteUrl: string) {
    const fromAddress = smtpUser ? `ID≠NTICAL <${smtpUser}>` : `ID≠NTICAL Loja <${FROM_EMAIL}>`;
    const extraHtml = `<div style="background: #eef2ff; padding: 15px; margin: 20px 0; border-left: 4px solid #4f46e5;">
    <p><strong>O cliente enviou um PDF/Comprovativo em anexo!</strong></p>
    <a href="${comprovanteUrl}" target="_blank" style="background:#4f46e5; color:#fff; text-decoration:none; padding:10px 15px; border-radius:4px; display:inline-block;">Ver Comprovativo (PDF/Imagem)</a>
    </div>`;

    await enviarEmail({
        from: fromAddress,
        to: ADMIN_EMAIL,
        subject: `[COMPROVATIVO RECEBIDO] Encomenda #${order.id.slice(0,8).toUpperCase()}`,
        html: getOrderHtml(
            order, 
            items, 
            "Comprovativo Submetido!", 
            "O cliente realizou a encomenda e enviou um comprovativo de transferência." + extraHtml
        )
    });
}
