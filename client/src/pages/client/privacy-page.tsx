export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
            Política de Privacidade
          </h1>
          <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-MZ")}</p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Introdução</h2>
            <p className="text-muted-foreground leading-relaxed">
              A IDENTICAL valoriza a sua privacidade. Esta Política de Privacidade explica como
              coletamos, usamos, divulgamos e protegemos as suas informações pessoais quando você
              usa o nosso website e serviços.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Informações que Coletamos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Coletamos as seguintes informações:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Nome completo, email e número de telefone</li>
              <li>Endereço de entrega</li>
              <li>Informações de pagamento (processadas de forma segura pela PaySuite)</li>
              <li>Histórico de pedidos e preferências de compra</li>
              <li>Dados de navegação e cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Como Usamos as Suas Informações</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Utilizamos as suas informações para:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Processar e enviar os seus pedidos</li>
              <li>Comunicar sobre o estado dos pedidos</li>
              <li>Melhorar a nossa loja e experiência do cliente</li>
              <li>Enviar newsletters e ofertas promocionais (com o seu consentimento)</li>
              <li>Prevenir fraudes e garantir segurança</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Partilha de Informações</h2>
            <p className="text-muted-foreground leading-relaxed">
              Não vendemos as suas informações pessoais. Partilhamos dados apenas com:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Processadores de pagamento (PaySuite) para concluir transações</li>
              <li>Empresas de logística para entregas</li>
              <li>Fornecedores de serviços que nos ajudam a operar o negócio</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Segurança de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Implementamos medidas de segurança adequadas para proteger as suas informações
              contra acesso não autorizado, alteração, divulgação ou destruição. No entanto,
              nenhum método de transmissão pela internet é 100% seguro.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Os Seus Direitos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Você tem o direito de:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Aceder às suas informações pessoais</li>
              <li>Corrigir dados incorretos</li>
              <li>Solicitar a eliminação dos seus dados</li>
              <li>Opor-se ao processamento de dados</li>
              <li>Retirar consentimento a qualquer momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos cookies para melhorar a sua experiência no site. Você pode configurar
              o seu navegador para recusar cookies, mas isso pode afetar algumas funcionalidades
              do site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Alterações a esta Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos
              sobre mudanças significativas através do email ou aviso no site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para questões sobre esta Política de Privacidade, contacte-nos em:
              <br />
              <a href="mailto:privacidade@identical.co.mz" className="text-primary hover:underline">
                privacidade@identical.co.mz
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
