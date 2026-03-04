import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ComboboxCreatableProps {
    /** Lista de opções existentes */
    options: { id: string; label: string }[];
    /** Valor selecionado (id) */
    value: string;
    /** Handler de seleção */
    onSelect: (id: string) => void;
    /** Handler de criação: devolve o id do novo item */
    onCreate: (name: string) => Promise<string>;
    placeholder?: string;
    createLabel?: string;
    isLoading?: boolean;
}

export function ComboboxCreatable({
    options,
    value,
    onSelect,
    onCreate,
    placeholder = "Selecionar...",
    createLabel = "Criar",
    isLoading = false,
}: ComboboxCreatableProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [creating, setCreating] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 50);
    }, [open]);

    const selected = options.find((o) => o.id === value);
    const filtered = options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
    );

    const showCreate =
        search.trim().length > 0 &&
        !options.some((o) => o.label.toLowerCase() === search.toLowerCase());

    const handleCreate = async () => {
        if (!search.trim()) return;
        setCreating(true);
        try {
            const newId = await onCreate(search.trim());
            onSelect(newId);
            setSearch("");
            setOpen(false);
        } finally {
            setCreating(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal h-10"
                >
                    <span className={cn(!selected && "text-muted-foreground")}>
                        {selected ? selected.label : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <div className="p-2 border-b">
                    <Input
                        ref={inputRef}
                        placeholder="Pesquisar ou criar novo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && showCreate) handleCreate();
                        }}
                    />
                </div>

                <div className="max-h-48 overflow-y-auto py-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <>
                            {/* Opção "Nenhum" */}
                            <button
                                className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                                onClick={() => { onSelect(""); setSearch(""); setOpen(false); }}
                            >
                                <Check className={cn("h-3 w-3", value === "" ? "opacity-100" : "opacity-0")} />
                                <span className="text-muted-foreground italic">Nenhum</span>
                            </button>

                            {filtered.map((option) => (
                                <button
                                    key={option.id}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                                    onClick={() => {
                                        onSelect(option.id === value ? "" : option.id);
                                        setSearch("");
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn("h-3 w-3 flex-shrink-0", value === option.id ? "opacity-100" : "opacity-0")}
                                    />
                                    {option.label}
                                </button>
                            ))}

                            {filtered.length === 0 && !showCreate && (
                                <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                                    Nenhuma opção encontrada
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* Criar novo */}
                {showCreate && (
                    <div className="border-t p-2">
                        <Button
                            size="sm"
                            className="w-full gap-1.5"
                            disabled={creating}
                            onClick={handleCreate}
                        >
                            {creating ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <Plus className="h-3 w-3" />
                            )}
                            {creating ? "A criar..." : `${createLabel} "${search.trim()}"`}
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
