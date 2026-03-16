export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
            Termos e Condições
          </h1>
          <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-MZ")}</p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao aceder e usar o website da ID≠NTICAL, você concorda em cumprir e estar vinculado
              a estes Termos e Condições. Se não concordar com qualquer parte destes termos,
              não deve usar o nosso website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Produtos e Preços</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Todos os produtos estão sujeitos a disponibilidade. Os preços estão em Meticais
              Moçambicanos (MZN) e podem ser alterados sem aviso prévio. Reservamo-nos o direito
              de:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Recusar ou cancelar qualquer pedido</li>
              <li>Limitar quantidades de compra</li>
              <li>Descontinuar produtos a qualquer momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Processo de Compra</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao fazer um pedido, você declara que todas as informações fornecidas são
              verdadeiras e corretas. A confirmação do pedido será enviada por email. A ID≠NTICAL
              reserva-se o direito de recusar ou cancelar pedidos por razões incluindo, mas não
              limitadas a, disponibilidade de produto, erros de preço ou suspeita de fraude.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Política de Pagamento</h2>
            <p className="text-muted-foreground leading-relaxed">
              Trabalhamos com uma rigorosa <strong>política de 50% antes</strong>. Para que o seu pedido seja processado e confirmado, é exigido o adiantamento de metade (50%) do valor total da encomenda. Os restantes 50% deverão ser liquidados no momento da entrega do produto.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Envio e Entrega</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              O nosso compromisso de entrega é rápido e eficiente:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Após a confirmação do pagamento dos 50% iniciais, <strong>recebes a tua camisete num prazo máximo de até 48 horas</strong>.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Os prazos são rigorosamente cumpridos para garantir a melhor experiência. A ID≠NTICAL assegura que terá a sua peça no tempo estipulado.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Devoluções e Trocas</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A fim de manter o nosso padrão de exclusividade e higiene, a nossa política dita que <strong>as trocas não são aceites</strong>.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Incentivamos todos os clientes a consultarem cuidadosamente a nossa Tabela de Tamanhos antes de formalizarem a encomenda. Exceções a esta regra (casos extremos de defeitos de fabrico) serão avaliadas pontualmente e apenas se:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>O produto estiver nas exatas condições originais, não usado.</li>
              <li>A reclamação for feita imediatamente no ato ou dia de entrega.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Propriedade Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              Todo o conteúdo do site, incluindo textos, gráficos, logos, imagens e software,
              é propriedade da ID≠NTICAL e está protegido por leis de direitos autorais. É
              proibida a reprodução, distribuição ou uso não autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              A ID≠NTICAL não será responsável por danos indiretos, incidentais ou
              consequenciais resultantes do uso ou impossibilidade de usar os nossos produtos
              ou serviços. A nossa responsabilidade está limitada ao valor do produto adquirido.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Modificações aos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Reservamo-nos o direito de modificar estes Termos e Condições a qualquer momento.
              As alterações entrarão em vigor imediatamente após publicação no site. O uso
              continuado do site após mudanças constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Lei Aplicável</h2>
            <p className="text-muted-foreground leading-relaxed">
              Estes Termos e Condições são regidos pelas leis de Moçambique. Qualquer disputa
              será resolvida nos tribunais competentes de Maputo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">11. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para questões sobre estes Termos e Condições, contacte-nos em:
              <br />
              <a href="mailto:legal@identical.co.mz" className="text-primary hover:underline">
                legal@identical.co.mz
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
