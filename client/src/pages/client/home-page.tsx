import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/client/ProductCard";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Product, Collection } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
const heroImage1 = "/attached_assets/IMG-20251110-WA0115_1763061428731.jpg";
const heroImage2 = "/attached_assets/IMG-20251110-WA0109_1763061428732.jpg";

export default function HomePage() {
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: collections = [], isLoading: collectionsLoading } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  const { data: settings } = useQuery<any>({
    queryKey: ["/api/settings"],
  });

  const featuredProducts = products.filter((p) => p.destaque).slice(0, 4);
  const newProducts = products.filter((p) => p.novo).slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Dark Wash */}
        <div className="absolute inset-0 z-0">
          <img
            src={settings?.banners?.[0] ?? heroImage1}
            alt="IDENTICAL Streetwear"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 uppercase tracking-tight">
            {settings?.heroTitle ?? (
              <>Be Different,<br />Be Classic</>
            )}
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {settings?.heroSubtitle ?? "Streetwear moçambicano autêntico. Raízes urbanas com forte identidade local."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/loja">
              <Button
                size="lg"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20"
                data-testid="button-hero-explore"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Explorar a Loja
              </Button>
            </Link>
            <Link href="/colecoes">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/30"
                data-testid="button-hero-collections"
              >
                Ver Coleções
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      {!collectionsLoading && collections.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">
              Coleções
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Descubra nossas coleções inspiradas na cultura urbana moçambicana
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {collections.slice(0, 2).map((collection) => (
              <Link key={collection.id} href={`/colecoes?collection=${collection.slug}`}>
                <Card className="group relative overflow-hidden rounded-lg aspect-[16/10] hover-elevate active-elevate-2 cursor-pointer">
                  {collection.imagem && (
                    <>
                      <img
                        src={collection.imagem}
                        alt={collection.nome}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    </>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 uppercase">
                      {collection.nome}
                    </h3>
                    {collection.descricao && (
                      <p className="text-white/80 text-sm md:text-base mb-4">
                        {collection.descricao}
                      </p>
                    )}
                    <Button variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white/30">
                      Ver Coleção
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">
            Produtos em Destaque
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Peças essenciais para o seu guarda-roupa urbano
          </p>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {(featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4)).map(
                (product) => (
                  <ProductCard key={product.id} product={product} />
                )
              )}
            </div>
            <div className="text-center mt-12">
              <Link href="/loja">
                <Button size="lg" variant="outline" data-testid="button-view-more">
                  Ver Mais Produtos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </section>

      {/* About Section */}
      <section className="bg-card border-y py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <img
                src={heroImage2}
                alt="Sobre IDENTICAL"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">
                Sobre a IDENTICAL
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Somos uma marca de streetwear moçambicana que valoriza a cultura urbana,
                  autenticidade e a influência da arte, música e estilo de vida das ruas.
                </p>
                <p>
                  Cada peça conta uma história, celebrando a identidade local e a expressão
                  individual. Das ruas de Maputo para o mundo, levamos o orgulho moçambicano
                  através do design e qualidade.
                </p>
                <p className="font-semibold text-foreground italic">
                  "Be different, be classic" - Esta é a nossa filosofia.
                </p>
              </div>
              <Link href="/sobre">
                <Button size="lg" data-testid="button-learn-more">
                  Saber Mais
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Instagram Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">
            #IDENTICAL
          </h2>
          <p className="text-muted-foreground">
            Junte-se à nossa comunidade urbana
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            "/attached_assets/IMG-20251110-WA0110_1763061428733.jpg",
            "/attached_assets/IMG-20251110-WA0111_1763061428734.jpg",
            "/attached_assets/IMG-20251110-WA0112_1763061428737.jpg",
            "/attached_assets/IMG-20251110-WA0113_1763061428738.jpg",
          ].map((img, index) => (
            <div
              key={index}
              className="aspect-square rounded-md overflow-hidden hover-elevate active-elevate-2 cursor-pointer"
            >
              <img src={img} alt={`IDENTICAL ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
