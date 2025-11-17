import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
            Contacto
          </h1>
          <p className="text-muted-foreground text-lg">
            Estamos aqui para ajudar. Entre em contacto connosco.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover-elevate">
            <CardContent className="p-6 flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Email</h3>
                <p className="text-muted-foreground mb-2">
                  Envie-nos um email e responderemos em breve
                </p>
                <a
                  href="mailto:contacto@identical.co.mz"
                  className="text-primary hover:underline font-medium"
                >
                  contacto@identical.co.mz
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6 flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Telefone / WhatsApp</h3>
                <p className="text-muted-foreground mb-2">
                  Ligue ou envie mensagem via WhatsApp
                </p>
                <a
                  href="tel:+258840000000"
                  className="text-primary hover:underline font-medium"
                >
                  +258 84 000 0000
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6 flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Morada</h3>
                <p className="text-muted-foreground">
                  Av. Julius Nyerere, 123
                  <br />
                  Maputo, Moçambique
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6 flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Horário de Atendimento</h3>
                <p className="text-muted-foreground">
                  Segunda a Sexta: 9h - 18h
                  <br />
                  Sábado: 9h - 13h
                  <br />
                  Domingo: Fechado
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 p-8 bg-card rounded-lg border">
          <h2 className="text-2xl font-bold mb-4">Siga-nos nas Redes Sociais</h2>
          <p className="text-muted-foreground mb-6">
            Fique a par das novidades, lançamentos e promoções exclusivas.
          </p>
          <div className="flex gap-4">
            <a
              href="https://instagram.com/identical"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover-elevate active-elevate-2"
            >
              Instagram
            </a>
            <a
              href="https://facebook.com/identical"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border rounded-md font-semibold hover-elevate active-elevate-2"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
