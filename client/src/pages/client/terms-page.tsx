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
              O nosso modelo de negócio funciona através de um sistema de pagamento dividido:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Sinal de 50%:</strong> Nenhum pedido é processado, reservado ou produzido sem a confirmação de adiantamento de 50% do valor total.</li>
              <li><strong>Pagamento no ato de entrega:</strong> O remanescente (restantes 50%) deverá ser liquidado integralmente ao estafeta ou ponto de recolha no momento de receção do artigo.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Envio e Entrega</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Assumimos um compromisso de celeridade extrema com os nossos clientes. Uma vez confirmado o adiantamento inicial de 50%, comprometemo-nos a entregar o seu artigo num <strong>prazo máximo de 48 horas</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Devoluções e Trocas</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Por motivos de estrito controlo de qualidade e salvaguarda da exclusividade de cada peça, <strong>a ID≠NTICAL não efetua trocas nem devoluções</strong>.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              É da inteira responsabilidade do cliente consultar detalhadamente o separador <a href="/guia-tamanhos" className="text-foreground underline">Guia de Tamanhos</a> antes de formalizar qualquer encomenda com adiantamento.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Exceções aplicáveis:</strong><br/>
              Analisaremos unicamente casos extremos ligados a defeitos de fabrico provados, obrigatoriamente cumprindo os seguintes critérios:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>O artigo não pode apresentar o mínimo indício de uso, lavagem ou alteração.</li>
              <li>A anomalia deve ser comunicada, de forma imediata e impreterível, no <strong>próprio dia e ato da entrega</strong>.</li>
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
