import nodemailer from 'nodemailer';
import dns from 'dns/promises';

export async function sendPasswordResetEmail(toEmail: string, resetLink: string) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn(`[EMAIL MOCK] Email de redefinição para ${toEmail} com link: ${resetLink}`);
        return { success: true, mocked: true };
    }

    try {
        // Resolver ativamente o IP v4 da Google e impedir que o Node faça fallback para IPv6 no Railway
        const ipv4Records = await dns.resolve4('smtp.gmail.com');
        const googleIPv4 = ipv4Records[0];
        console.log(`[EMAIL] A usar IPv4 explícito para a Google: ${googleIPv4}`);

        const transporter = nodemailer.createTransport({
            host: googleIPv4,
            port: 465, // Voltar a usar 465 (SSL fechado de ponta a ponta)
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                // Muito importante: Dizer ao Google que a Firewall/Certificado é para smtp.gmail.com
                // Apesar de estarmos a bater à porta via IP numérico
                servername: 'smtp.gmail.com'
            },
            connectionTimeout: 15000, 
            greetingTimeout: 10000,
            socketTimeout: 15000,
        });
        const info = await transporter.sendMail({
            from: `"ID≠NTICAL Angola" <${process.env.SMTP_USER}>`, // email do remetente
            to: toEmail,
            subject: "Recuperação de Password - ID≠NTICAL",
            html: `
                <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
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

        console.log("Email enviado: %s", info.messageId);
        return { success: true, mocked: false };
    } catch (error: any) {
        console.error("Erro ao enviar email de recuperação:", error);
        return { success: false, error: error.message };
    }
}
