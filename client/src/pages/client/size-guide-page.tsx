import { Ruler } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ── Dados de tamanhos ─────────────────────────────────────────────── */

const normalSizes = [
  { size: "XS", peito: "82–87", cintura: "68–72", ombro: "40", comprimento: "65", equiv: "32–34" },
  { size: "S",  peito: "88–93", cintura: "73–77", ombro: "42", comprimento: "68", equiv: "36–38" },
  { size: "M",  peito: "94–99", cintura: "78–83", ombro: "44", comprimento: "71", equiv: "40–42" },
  { size: "L",  peito: "100–105", cintura: "84–89", ombro: "46", comprimento: "74", equiv: "44–46" },
  { size: "XL", peito: "106–112", cintura: "90–96", ombro: "48", comprimento: "77", equiv: "48–50" },
  { size: "XXL",peito: "113–120", cintura: "97–104", ombro: "50", comprimento: "80", equiv: "52–54" },
];

const oversizedSizes = [
  { size: "XS", peito: "82–87", cintura: "68–72", larguraPeca: "52", comprimento: "72", ombro: "50" },
  { size: "S",  peito: "88–93", cintura: "73–77", larguraPeca: "55", comprimento: "74", ombro: "52" },
  { size: "M",  peito: "94–99", cintura: "78–83", larguraPeca: "58", comprimento: "76", ombro: "54" },
  { size: "L",  peito: "100–105", cintura: "84–89", larguraPeca: "61", comprimento: "78", ombro: "56" },
  { size: "XL", peito: "106–112", cintura: "90–96", larguraPeca: "64", comprimento: "80", ombro: "58" },
  { size: "XXL",peito: "113–120", cintura: "97–104", larguraPeca: "67", comprimento: "83", ombro: "60" },
];

const hoodieSizes = [
  { size: "XS", peito: "82–87", cintura: "68–72", ombro: "42", comprimento: "67", manga: "60" },
  { size: "S",  peito: "88–93", cintura: "73–77", ombro: "44", comprimento: "70", manga: "62" },
  { size: "M",  peito: "94–99", cintura: "78–83", ombro: "46", comprimento: "73", manga: "63" },
  { size: "L",  peito: "100–105", cintura: "84–89", ombro: "48", comprimento: "76", manga: "64" },
  { size: "XL", peito: "106–112", cintura: "90–96", ombro: "50", comprimento: "79", manga: "65" },
  { size: "XXL",peito: "113–120", cintura: "97–104", ombro: "52", comprimento: "82", manga: "66" },
];

/* ── Sub-componentes ───────────────────────────────────────────────── */

function SizeRow({ row, columns }: { row: any; columns: { key: string; label: string }[] }) {
  const colors = ["", "XS", "S", "M", "L", "XL", "XXL"];
  const colorMap: Record<string, string> = {
    XS: "bg-violet-500",
    S: "bg-blue-500",
    M: "bg-emerald-500",
    L: "bg-amber-500",
    XL: "bg-orange-500",
    XXL: "bg-red-500",
  };
  return (
    <tr className="border-t transition-colors hover:bg-muted/30">
      <td className="px-6 py-4">
        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-xs ${colorMap[row.size] ?? "bg-primary"}`}>
          {row.size}
        </span>
      </td>
      {columns.map((col) => (
        <td key={col.key} className="px-4 py-4 text-center font-medium">
          {row[col.key]}
        </td>
      ))}
    </tr>
  );
}

function SizeTable({
  data,
  columns,
  note,
}: {
  data: any[];
  columns: { key: string; label: string; sub?: string }[];
  note?: string;
}) {
  return (
    <div className="rounded-xl border overflow-hidden shadow-sm">
      {note && (
        <div className="bg-muted/40 px-6 py-2 border-b text-xs text-muted-foreground italic">
          {note}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left px-6 py-3 font-bold text-base">Tamanho</th>
              {columns.map((col) => (
                <th key={col.key} className="text-center px-4 py-3 font-semibold">
                  <div>{col.label}</div>
                  {col.sub && <div className="text-xs font-normal text-muted-foreground">{col.sub}</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <SizeRow key={row.size} row={row} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Página principal ──────────────────────────────────────────────── */

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Cabeçalho */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Ruler className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-3">
            Guia de Tamanhos
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Todas as medidas em <strong>centímetros (cm)</strong>. Meça sempre o <strong>corpo</strong> — não a roupa — para um resultado mais preciso.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="normal" className="mb-12">
          <TabsList className="grid grid-cols-3 w-full h-12 mb-6">
            <TabsTrigger value="normal" className="text-sm font-semibold gap-2">
              👕 T-shirt Normal
            </TabsTrigger>
            <TabsTrigger value="oversized" className="text-sm font-semibold gap-2">
              🔲 Oversized
            </TabsTrigger>
            <TabsTrigger value="hoodie" className="text-sm font-semibold gap-2">
              🧥 Hoodie
            </TabsTrigger>
          </TabsList>

          {/* ─── T-SHIRT NORMAL ─── */}
          <TabsContent value="normal" className="space-y-4">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 text-sm text-blue-800 dark:text-blue-300">
              <strong>Corte normal/regular</strong> — a peça acompanha o contorno do corpo sem ser muito justa nem muito larga. Ideal para uso casual.
            </div>
            <SizeTable
              data={normalSizes}
              note="Medidas do corpo (não da peça)"
              columns={[
                { key: "peito",       label: "Peito",       sub: "(cm)" },
                { key: "cintura",     label: "Cintura",     sub: "(cm)" },
                { key: "ombro",       label: "Ombro",       sub: "(cm)" },
                { key: "comprimento", label: "Comprimento", sub: "(cm)" },
                { key: "equiv",       label: "Equiv. EU",   sub: "(nº)" },
              ]}
            />
          </TabsContent>

          {/* ─── OVERSIZED ─── */}
          <TabsContent value="oversized" className="space-y-4">
            <div className="rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 p-4 text-sm text-purple-800 dark:text-purple-300">
              <strong>Corte oversized</strong> — a peça é significativamente maior que o corpo, com ombros descaídos e corpo largo. Para saber o teu número, usa as medidas do <em>corpo</em> abaixo — a peça já tem a folga incluída.
            </div>
            <SizeTable
              data={oversizedSizes}
              note="Medidas do corpo — a roupa é propositadamente maior"
              columns={[
                { key: "peito",      label: "Peito corpo", sub: "(cm)" },
                { key: "cintura",    label: "Cintura corpo", sub: "(cm)" },
                { key: "ombro",      label: "Ombro peça",  sub: "(cm)" },
                { key: "larguraPeca",label: "Largura peça", sub: "(cm)" },
                { key: "comprimento",label: "Comprimento",  sub: "(cm)" },
              ]}
            />
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-400">
              💡 <strong>Dica:</strong> No oversized, se quiseres um look mais volumoso vai ao tamanho acima. Se preferires que a peça não desça muito pelos ombros, fica no teu tamanho habitual.
            </div>
          </TabsContent>

          {/* ─── HOODIE ─── */}
          <TabsContent value="hoodie" className="space-y-4">
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-4 text-sm text-emerald-800 dark:text-emerald-300">
              <strong>Hoodie / Sweatshirt</strong> — corte ligeiramente mais largo que o normal para conforto e sobreposição. Usa as tuas medidas corporais para escolher.
            </div>
            <SizeTable
              data={hoodieSizes}
              note="Medidas do corpo (não da peça)"
              columns={[
                { key: "peito",       label: "Peito",       sub: "(cm)" },
                { key: "cintura",     label: "Cintura",     sub: "(cm)" },
                { key: "ombro",       label: "Ombro",       sub: "(cm)" },
                { key: "comprimento", label: "Comprimento", sub: "(cm)" },
                { key: "manga",       label: "Manga",       sub: "(cm)" },
              ]}
            />
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-400">
              💡 <strong>Dica hoodie:</strong> Se vais usar por cima de outras camisolas, sobe um tamanho para maior conforto. O comprimento de manga é medido do ombro até ao pulso.
            </div>
          </TabsContent>
        </Tabs>

        {/* Como Medir */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
            <Ruler className="h-6 w-6" /> Como Medir Correctamente
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: "📏", title: "Peito", desc: "Meça à volta da parte mais larga do peito, passando pelas axilas. Mantenha a fita métrica horizontal e nivelada." },
              { icon: "📐", title: "Cintura", desc: "Meça à volta da parte mais estreita do tronco, geralmente 2–3 cm acima do umbigo." },
              { icon: "↔️", title: "Ombro", desc: "Meça de ponta a ponta, da costura de um ombro à costura do outro, pelas costas." },
              { icon: "↕️", title: "Comprimento", desc: "Para t-shirts: da costura do ombro até à bainha. Para mangas: do ombro até ao pulso com braço estendido." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-5 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                <div className="text-3xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h4 className="font-bold mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Entre dois tamanhos */}
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-6 mb-10">
          <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-2">💡 Entre dois tamanhos?</h3>
          <p className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed">
            Se as tuas medidas ficarem entre dois tamanhos, para <strong>T-shirt Normal</strong> pega no tamanho <em>menor</em> para um fit mais justo, ou no <em>maior</em> para mais conforto. Para <strong>Oversized e Hoodie</strong>, recomendamos sempre o tamanho <em>acima</em>.
          </p>
        </div>

        {/* Dúvidas */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-bold text-lg mb-3">📌 Ainda tens dúvidas?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Se não tiveres a certeza do tamanho, envia-nos as tuas medidas (peito, cintura, altura) e ajudamos a escolher o melhor tamanho para ti.
          </p>
          <a
            href="https://wa.me/258848755045"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition-colors"
          >
            💬 Fala connosco no WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
}
