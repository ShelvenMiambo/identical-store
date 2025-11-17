import { Card } from "@/components/ui/card";
import { Target, Heart, Users, Award } from "lucide-react";
import heroImage from "@assets/IMG-20251110-WA0104_1763061428739.jpg";

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Autenticidade",
      description:
        "Cada peça reflete a verdadeira essência da cultura urbana moçambicana, sem imitações.",
    },
    {
      icon: Heart,
      title: "Qualidade",
      description:
        "Materiais premium e design cuidadoso para produtos que duram e impressionam.",
    },
    {
      icon: Users,
      title: "Comunidade",
      description:
        "Mais que uma marca, somos um movimento que celebra a individualidade e expressão.",
    },
    {
      icon: Award,
      title: "Inovação",
      description:
        "Sempre a criar, sempre a evoluir, sempre a empurrar os limites do streetwear local.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="IDENTICAL - Sobre nós"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 uppercase tracking-tight">
            Sobre a IDENTICAL
          </h1>
          <p className="text-xl text-white/90 italic">
            "Be Different, Be Classic"
          </p>
        </div>
      </section>

      {/* Main Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 uppercase tracking-tight">
              A Nossa História
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                A IDENTICAL nasceu das ruas de Maputo, onde a cultura urbana pulsa com energia,
                criatividade e autenticidade. Somos mais do que uma marca de streetwear - somos
                uma celebração da identidade moçambicana moderna.
              </p>
              <p>
                Cada t-shirt, cada design, cada coleção conta uma história. As histórias das
                ruas, dos artistas, dos músicos, dos criadores que fazem de Moçambique um lugar
                único. Valorizamos a cultura urbana, a autenticidade e a influência da arte,
                música e estilo de vida das ruas.
              </p>
              <p>
                O nosso objetivo é simples: criar peças que representem quem somos - diferentes,
                mas clássicos. Urbanos, mas com raízes. Modernos, mas com história.
              </p>
            </div>
          </div>

          <div className="pt-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 uppercase tracking-tight">
              Raízes Urbanas
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              "Raízes Urbanas" não é apenas um slogan - é a nossa filosofia. Representa a conexão
              entre o passado e o presente, entre a tradição e a inovação, entre o local e o
              global. Cada coleção é inspirada pelas ruas que nos viram crescer, pela música que
              nos move, pela arte que nos inspira.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-card border-y py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">
              Os Nossos Valores
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Princípios que guiam tudo o que criamos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="p-6 hover-elevate cursor-default">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="bg-primary/5 rounded-lg p-8 md:p-12 border-l-4 border-primary">
          <blockquote className="text-2xl md:text-3xl font-bold leading-relaxed mb-4">
            "A nossa missão é vestir a próxima geração de criadores, sonhadores e fazedores que
            estão a moldar o futuro de Moçambique."
          </blockquote>
          <p className="text-muted-foreground text-lg">
            Cada compra que faz apoia artistas locais, criadores de conteúdo e a crescente cena
            streetwear moçambicana. Juntos, estamos a construir algo especial.
          </p>
        </div>
      </section>

      {/* Join Movement */}
      <section className="bg-card py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-6">
            Junte-se ao Movimento
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Seja parte da comunidade IDENTICAL. Vista-se com propósito. Vista-se com identidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/loja">
              <button className="px-8 py-4 bg-primary text-primary-foreground rounded-md font-semibold text-lg hover-elevate active-elevate-2">
                Explorar Coleções
              </button>
            </a>
            <a href="https://instagram.com/identical" target="_blank" rel="noopener noreferrer">
              <button className="px-8 py-4 border rounded-md font-semibold text-lg hover-elevate active-elevate-2">
                Seguir no Instagram
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
