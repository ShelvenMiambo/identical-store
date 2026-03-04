import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product, Collection, Category } from "@shared/schema";
import { ProductCard } from "@/components/client/ProductCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CollectionsPage() {
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Extract unique sizes and colors
  const allSizes = Array.from(new Set(products.flatMap((p) => p.tamanhos)));
  const allColors = Array.from(new Set(products.flatMap((p) => p.cores)));

  // Filter products
  let filteredProducts = products.filter((p) => p.ativo);

  if (selectedCollections.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      selectedCollections.includes(p.collectionId || "")
    );
  }
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  if (selectedCategories.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      selectedCategories.includes((p as any).categoryId || "")
    );
  }

  if (selectedSizes.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      p.tamanhos.some((size) => selectedSizes.includes(size))
    );
  }

  if (selectedColors.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      p.cores.some((color) => selectedColors.includes(color))
    );
  }

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.preco) - parseFloat(b.preco);
      case "price-high":
        return parseFloat(b.preco) - parseFloat(a.preco);
      case "name":
        return a.nome.localeCompare(b.nome);
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const FilterSection = () => (
    <div className="space-y-8">
      {/* Collections Filter */}
      {collections.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Coleção</h3>
          <div className="space-y-3">
            {collections.map((collection) => (
              <div key={collection.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`collection-${collection.id}`}
                  checked={selectedCollections.includes(collection.id)}
                  onCheckedChange={(checked) => {
                    setSelectedCollections(
                      checked
                        ? [...selectedCollections, collection.id]
                        : selectedCollections.filter((id) => id !== collection.id)
                    );
                  }}
                  data-testid={`checkbox-collection-${collection.slug}`}
                />
                <Label
                  htmlFor={`collection-${collection.id}`}
                  className="text-sm cursor-pointer"
                >
                  {collection.nome}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Size Filter */}
      {allSizes.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Tamanho</h3>
          <div className="space-y-3">
            {allSizes.map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <Checkbox
                  id={`size-${size}`}
                  checked={selectedSizes.includes(size)}
                  onCheckedChange={(checked) => {
                    setSelectedSizes(
                      checked
                        ? [...selectedSizes, size]
                        : selectedSizes.filter((s) => s !== size)
                    );
                  }}
                  data-testid={`checkbox-size-${size}`}
                />
                <Label htmlFor={`size-${size}`} className="text-sm cursor-pointer">
                  {size}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Color Filter */}
      {allColors.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Cor</h3>
          <div className="space-y-3">
            {allColors.map((color) => (
              <div key={color} className="flex items-center space-x-2">
                <Checkbox
                  id={`color-${color}`}
                  checked={selectedColors.includes(color)}
                  onCheckedChange={(checked) => {
                    setSelectedColors(
                      checked
                        ? [...selectedColors, color]
                        : selectedColors.filter((c) => c !== color)
                    );
                  }}
                  data-testid={`checkbox-color-${color}`}
                />
                <Label htmlFor={`color-${color}`} className="text-sm cursor-pointer">
                  {color}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Category Filter */}
      {categories.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Categoria</h3>
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${cat.id}`}
                  checked={selectedCategories.includes(cat.id)}
                  onCheckedChange={(checked) => {
                    setSelectedCategories(
                      checked
                        ? [...selectedCategories, cat.id]
                        : selectedCategories.filter((id) => id !== cat.id)
                    );
                  }}
                />
                <Label htmlFor={`category-${cat.id}`} className="text-sm cursor-pointer">
                  {cat.nome}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {(selectedCollections.length > 0 ||
        selectedSizes.length > 0 ||
        selectedColors.length > 0 ||
        selectedCategories.length > 0) && (
          <>
            <Separator />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSelectedCollections([]);
                setSelectedSizes([]);
                setSelectedColors([]);
                setSelectedCategories([]);
              }}
              data-testid="button-clear-filters"
            >
              Limpar Filtros
            </Button>
          </>
        )}
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
            Loja
          </h1>
          <p className="text-muted-foreground">
            {sortedProducts.length} produto{sortedProducts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 gap-4">
          {/* Mobile Filter Button */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden" data-testid="button-mobile-filters">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <FilterSection />
            </SheetContent>
          </Sheet>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]" data-testid="select-sort">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mais Recente</SelectItem>
              <SelectItem value="price-low">Preço: Baixo - Alto</SelectItem>
              <SelectItem value="price-high">Preço: Alto - Baixo</SelectItem>
              <SelectItem value="name">Nome A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <FilterSection />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {productsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[3/4] w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg mb-4">
                  Nenhum produto encontrado
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCollections([]);
                    setSelectedSizes([]);
                    setSelectedColors([]);
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
