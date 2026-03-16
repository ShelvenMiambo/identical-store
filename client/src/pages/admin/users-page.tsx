import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
    Trash2,
    Pencil,
    Upload,
    GripVertical,
    Shield,
    User,
    ImageIcon,
    Users,
    CheckCircle2,
    XCircle,
} from "lucide-react";

/* ─────────────────────────────── Types ──────────────────────── */
interface SiteSettings {
    heroTitle: string;
    heroSubtitle: string;
    banners: string[];
    highlights: { title: string; description?: string; image?: string }[];
}

interface AdminUser {
    id: string;
    username: string;
    nome: string;
    email: string;
    isAdmin: boolean;
    createdAt: string;
}

/* ═══════════════════════════ COMPONENT ══════════════════════════ */
export default function UsersPage() {
    const { toast } = useToast();
    const qc = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    /* ── Settings / Slideshow ── */
    const { data: settings } = useQuery<SiteSettings>({ queryKey: ["/api/settings"] });
    const [banners, setBanners] = useState<string[]>([]);

    /* Sync banners from server */
    useState(() => {
        if (settings?.banners) setBanners(settings.banners);
    });

    /* Keep banners in sync when settings load */
    const [bannersInit, setBannersInit] = useState(false);
    if (settings && !bannersInit) {
        setBanners(settings.banners ?? []);
        setBannersInit(true);
    }

    const saveSettingsMutation = useMutation({
        mutationFn: (data: Partial<SiteSettings>) =>
            apiRequest("PUT", "/api/admin/settings", data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["/api/settings"] });
            toast({ title: "Slideshow guardado com sucesso!" });
        },
        onError: (e: any) =>
            toast({ title: "Erro ao guardar", description: e.message, variant: "destructive" }),
    });

    const handleUploadSlide = async (file: File) => {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const resp = await apiRequest("POST", "/api/admin/upload-base64", {
                    filename: file.name,
                    dataUrl: reader.result as string,
                    tipo: "slideshow",
                });
                setBanners((prev) => [...prev, resp.url]);
                toast({ title: "Imagem adicionada! Clique em Guardar." });
            } catch (err: any) {
                toast({ title: "Falha no upload", description: err.message, variant: "destructive" });
            }
        };
        reader.readAsDataURL(file);
    };

    const removeSlide = (idx: number) => setBanners((prev) => prev.filter((_, i) => i !== idx));

    const moveSlide = (idx: number, dir: -1 | 1) => {
        const next = [...banners];
        const swap = idx + dir;
        if (swap < 0 || swap >= next.length) return;
        [next[idx], next[swap]] = [next[swap], next[idx]];
        setBanners(next);
    };

    /* ── Users ── */
    const { data: users = [], isLoading: usersLoading } = useQuery<AdminUser[]>({
        queryKey: ["/api/admin/users"],
    });

    const [editUser, setEditUser] = useState<AdminUser | null>(null);
    const [editForm, setEditForm] = useState({ nome: "", email: "", password: "", isAdmin: false });
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

    const openEdit = (u: AdminUser) => {
        setEditUser(u);
        setEditForm({ nome: u.nome ?? "", email: u.email ?? "", password: "", isAdmin: u.isAdmin });
    };

    const updateUserMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            apiRequest("PUT", `/api/admin/users/${id}`, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({ title: "Utilizador atualizado!" });
            setEditUser(null);
        },
        onError: (e: any) =>
            toast({ title: "Erro ao atualizar", description: e.message, variant: "destructive" }),
    });

    const deleteUserMutation = useMutation({
        mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/users/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({ title: "Utilizador apagado." });
            setDeleteUserId(null);
        },
        onError: (e: any) =>
            toast({ title: "Erro ao apagar", description: e.message, variant: "destructive" }),
    });

    const handleSaveUser = () => {
        if (!editUser) return;
        const payload: any = { nome: editForm.nome, email: editForm.email, isAdmin: editForm.isAdmin };
        if (editForm.password.trim()) payload.password = editForm.password.trim();
        updateUserMutation.mutate({ id: editUser.id, data: payload });
    };

    /* ════════════════ RENDER ════════════════ */
    return (
        <div className="space-y-10">
            {/* ──────── Header ──────── */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    Utilizadores & Slideshow
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Gerencie as imagens do hero e os utilizadores registados
                </p>
            </div>

            {/* ══════════ SLIDESHOW MANAGER ══════════ */}
            <Card>
                <CardHeader className="flex flex-row items-center gap-3">
                    <div className="bg-slate-900 text-white p-2 rounded-lg">
                        <ImageIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle>Imagens do Slideshow</CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Arranje a ordem e carregue novas imagens para o hero do site
                        </p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Slide list */}
                    {banners.length === 0 ? (
                        <div className="border-2 border-dashed rounded-lg p-10 text-center text-muted-foreground">
                            <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p>Nenhuma imagem no slideshow ainda.</p>
                            <p className="text-sm">Carregue imagens abaixo para começar.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {banners.map((url, idx) => (
                                <div key={url + idx} className="relative group rounded-lg overflow-hidden border shadow-sm aspect-video bg-slate-100">
                                    <img src={url} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                                    {/* Overlay controls */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                        <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded self-start">
                                            #{idx + 1}
                                        </span>
                                        <div className="flex gap-1 justify-center">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-white hover:bg-white/20"
                                                onClick={() => moveSlide(idx, -1)}
                                                disabled={idx === 0}
                                                title="Mover para a esquerda"
                                            >
                                                ◀
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                className="h-7 w-7"
                                                onClick={() => removeSlide(idx)}
                                                title="Remover"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-white hover:bg-white/20"
                                                onClick={() => moveSlide(idx, 1)}
                                                disabled={idx === banners.length - 1}
                                                title="Mover para a direita"
                                            >
                                                ▶
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-4 w-4" />
                            Carregar Imagem
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleUploadSlide(f);
                                e.currentTarget.value = "";
                            }}
                        />
                        <Button
                            className="gap-2"
                            onClick={() => saveSettingsMutation.mutate({ banners })}
                            disabled={saveSettingsMutation.isPending}
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            {saveSettingsMutation.isPending ? "A guardar..." : "Guardar Slideshow"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ══════════ USERS TABLE ══════════ */}
            <Card>
                <CardHeader className="flex flex-row items-center gap-3">
                    <div className="bg-slate-900 text-white p-2 rounded-lg">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle>Utilizadores Registados</CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Gerencie contas de clientes e administradores
                        </p>
                    </div>
                </CardHeader>
                <CardContent>
                    {usersLoading ? (
                        <div className="text-center py-10 text-muted-foreground">A carregar utilizadores…</div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <User className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p>Nenhum utilizador registado ainda.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800 border-b">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Utilizador</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Email</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Tipo</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Registado em</th>
                                        <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm uppercase">
                                                        {(u.nome || u.username || "?")[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{u.nome || "—"}</p>
                                                        <p className="text-xs text-muted-foreground">@{u.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                                            <td className="px-4 py-3">
                                                {u.isAdmin ? (
                                                    <Badge className="gap-1 bg-slate-900 text-white">
                                                        <Shield className="h-3 w-3" /> Admin
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="gap-1">
                                                        <User className="h-3 w-3" /> Cliente
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {new Date(u.createdAt).toLocaleDateString("pt-PT")}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1.5"
                                                        onClick={() => openEdit(u)}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="gap-1.5"
                                                        onClick={() => setDeleteUserId(u.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Apagar
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ══ Edit User Dialog ══ */}
            <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" /> Editar Utilizador
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Nome</Label>
                            <Input
                                value={editForm.nome}
                                onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Nova Password <span className="text-muted-foreground text-xs">(deixe em branco para não alterar)</span></Label>
                            <Input
                                type="password"
                                value={editForm.password}
                                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                            <input
                                id="isAdminCheck"
                                type="checkbox"
                                className="h-4 w-4 accent-slate-900"
                                checked={editForm.isAdmin}
                                onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked })}
                            />
                            <Label htmlFor="isAdminCheck" className="cursor-pointer flex items-center gap-2">
                                <Shield className="h-4 w-4 text-slate-600" />
                                Este utilizador é Administrador
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditUser(null)}>Cancelar</Button>
                        <Button onClick={handleSaveUser} disabled={updateUserMutation.isPending}>
                            {updateUserMutation.isPending ? "A guardar…" : "Guardar Alterações"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ══ Delete Confirm Dialog ══ */}
            <AlertDialog open={!!deleteUserId} onOpenChange={(o) => !o && setDeleteUserId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <XCircle className="h-5 w-5" /> Apagar Utilizador
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem a certeza que deseja apagar este utilizador? Esta ação é permanente e não pode
                            ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => deleteUserId && deleteUserMutation.mutate(deleteUserId)}
                        >
                            Apagar Definitivamente
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
