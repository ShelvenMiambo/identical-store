import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import { Redirect } from "wouter";
import heroImage from "@assets/IMG-20251110-WA0110_1763061428733.jpg";

const loginSchema = z.object({
  username: z.string().min(3, "Username deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Password deve ter pelo menos 6 caracteres"),
});

const registerSchema = z.object({
  nome: z.string().min(3, "Nome completo é obrigatório"),
  email: z.string().email("Email inválido"),
  username: z.string().min(3, "Username deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Password deve ter pelo menos 6 caracteres"),
  telefone: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthPageProps {
  user?: any;
  onLogin?: (data: LoginFormData) => Promise<void>;
  onRegister?: (data: RegisterFormData) => Promise<void>;
}

export default function AuthPage({ user, onLogin, onRegister }: AuthPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegisterPw, setShowRegisterPw] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", nome: "", password: "", telefone: "" },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      if (onLogin) await onLogin(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      if (onRegister) await onRegister(data);
    } finally {
      setIsLoading(false);
    }
  };

  if (user) return <Redirect to="/" />;

  return (
    /* pt-16 compensa o header fixo */
    <div className="min-h-screen pt-16 md:pt-0 md:grid md:grid-cols-2">

      {/* ─── Coluna do formulário ───────────────────────────── */}
      <div className="flex flex-col justify-center px-4 py-8 md:py-12 md:px-12 bg-background">

        {/* Brand mark – visível em mobile no topo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">
            ID<span style={{fontSize: '1.2em', lineHeight: 1}}>≠</span>NTICAL
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Be Different, Be Classic</p>
        </div>

        {/* Tabs */}
        <div className="w-full max-w-sm mx-auto">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 mb-4">
              <TabsTrigger value="login" className="text-base font-semibold" data-testid="tab-login">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="register" className="text-base font-semibold" data-testid="tab-register">
                Criar Conta
              </TabsTrigger>
            </TabsList>

            {/* ─── LOGIN ─── */}
            <TabsContent value="login">
              <Card className="border shadow-sm">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
                  <CardDescription>Entre com o seu username e password</CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">Username</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="seu_username"
                                autoComplete="username"
                                className="h-12 text-base"
                                {...field}
                                data-testid="input-login-username"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showLoginPw ? "text" : "password"}
                                  placeholder="••••••••"
                                  autoComplete="current-password"
                                  className="h-12 text-base pr-11"
                                  {...field}
                                  data-testid="input-login-password"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowLoginPw(p => !p)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                  tabIndex={-1}
                                  aria-label={showLoginPw ? "Ocultar password" : "Mostrar password"}
                                >
                                  {showLoginPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-bold mt-2"
                        disabled={isLoading}
                        data-testid="button-login-submit"
                      >
                        {isLoading ? "A entrar..." : "Entrar"}
                      </Button>

                      {/* Esqueci a password → WhatsApp do admin */}
                      <div className="text-center pt-1">
                        <a
                          href={(() => {
                            const username = loginForm.getValues("username");
                            const msg = username
                              ? `Olá, esqueci a minha password. O meu username é: *${username}*. Podem ajudar-me a recuperar o acesso?`
                              : `Olá, esqueci a minha password da loja ID≠NTICAL. Podem ajudar-me a recuperar o acesso?`;
                            return `https://wa.me/258848755045?text=${encodeURIComponent(msg)}`;
                          })()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
                          data-testid="link-forgot-password"
                        >
                          Esqueci a password
                        </a>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── REGISTER ─── */}
            <TabsContent value="register">
              <Card className="border shadow-sm">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-xl">Criar Conta</CardTitle>
                  <CardDescription>Preencha os seus dados para se registar</CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-3">
                      <FormField
                        control={registerForm.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">Nome Completo</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="João Silva"
                                autoComplete="name"
                                className="h-12 text-base"
                                {...field}
                                data-testid="input-register-nome"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="joao@exemplo.com"
                                autoComplete="email"
                                className="h-12 text-base"
                                {...field}
                                data-testid="input-register-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold">Username</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="joao123"
                                  autoComplete="username"
                                  className="h-12 text-base"
                                  {...field}
                                  data-testid="input-register-username"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="telefone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold">Telefone <span className="font-normal text-muted-foreground">(opc.)</span></FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="+258 84..."
                                  autoComplete="tel"
                                  className="h-12 text-base"
                                  {...field}
                                  data-testid="input-register-telefone"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showRegisterPw ? "text" : "password"}
                                  placeholder="Mínimo 6 caracteres"
                                  autoComplete="new-password"
                                  className="h-12 text-base pr-11"
                                  {...field}
                                  data-testid="input-register-password"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowRegisterPw(p => !p)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                  tabIndex={-1}
                                  aria-label={showRegisterPw ? "Ocultar password" : "Mostrar password"}
                                >
                                  {showRegisterPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-bold mt-2"
                        disabled={isLoading}
                        data-testid="button-register-submit"
                      >
                        {isLoading ? "A criar conta..." : "Criar Conta"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ─── Coluna da imagem (só desktop) ─────────────────── */}
      <div className="hidden md:block relative overflow-hidden">
        <img
          src={heroImage}
          alt="ID≠NTICAL Streetwear"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center p-12 text-white">
          <div className="max-w-md space-y-6">
            <h2 className="text-4xl font-bold uppercase tracking-tight">
              Cultura Urbana<br />Autêntica
            </h2>
            <p className="text-lg text-white/90">
              Junte-se à comunidade ID≠NTICAL e explore coleções que celebram a identidade
              moçambicana.
            </p>
            <ul className="space-y-3 text-white/80 text-lg">
              <li className="flex items-center gap-3">
                <span className="text-primary font-bold">✓</span> Produtos exclusivos
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary font-bold">✓</span> Entrega rápida em Moçambique
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary font-bold">✓</span> Pagamentos: M-Pesa, e-Mola e Conta Bancária
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}