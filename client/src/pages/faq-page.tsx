import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  const faqs = [
    {
      question: "Como faço um pedido?",
      answer:
        "Navegue pela nossa loja, selecione os produtos que deseja, escolha o tamanho e cor, e adicione ao carrinho. Depois, vá ao checkout e preencha os seus dados de entrega. Será redirecionado para o PaySuite para completar o pagamento.",
    },
    {
      question: "Quais métodos de pagamento aceitam?",
      answer:
        "Aceitamos M-Pesa, e-Mola e cartões de crédito/débito através da plataforma PaySuite, garantindo segurança e praticidade nas suas compras.",
    },
    {
      question: "Quanto tempo demora a entrega?",
      answer:
        "Para Maputo e arredores, a entrega demora 3-5 dias úteis. Para outras províncias, entre 5-7 dias úteis. Receberá atualizações sobre o estado do seu pedido por email.",
    },
    {
      question: "Qual é a política de trocas e devoluções?",
      answer:
        "Aceitamos trocas e devoluções em até 14 dias após a entrega, desde que o produto esteja em perfeitas condições, com etiquetas originais. Entre em contacto connosco para iniciar o processo.",
    },
    {
      question: "Os produtos têm garantia?",
      answer:
        "Sim, todos os nossos produtos têm garantia de qualidade. Se encontrar algum defeito de fabricação, entre em contacto connosco para resolver a situação.",
    },
    {
      question: "Como posso acompanhar o meu pedido?",
      answer:
        "Após fazer o pedido, receberá um email de confirmação. Pode acompanhar o estado do seu pedido na área 'Minha Conta' no nosso site.",
    },
    {
      question: "Fazem entregas em todo Moçambique?",
      answer:
        "Sim, fazemos entregas em todas as províncias de Moçambique. Os prazos de entrega podem variar conforme a localização.",
    },
    {
      question: "Como posso entrar em contacto com o apoio ao cliente?",
      answer:
        "Pode entrar em contacto através do email ou WhatsApp indicados na página de Contacto. Estamos disponíveis de segunda a sexta, das 9h às 18h.",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
            Perguntas Frequentes
          </h1>
          <p className="text-muted-foreground text-lg">
            Encontre respostas para as perguntas mais comuns
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-semibold">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 p-8 bg-card rounded-lg border text-center">
          <h3 className="text-xl font-bold mb-2">Não encontrou o que procurava?</h3>
          <p className="text-muted-foreground mb-6">
            Entre em contacto connosco e teremos prazer em ajudar.
          </p>
          <a href="/contacto">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover-elevate active-elevate-2">
              Contactar-nos
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
