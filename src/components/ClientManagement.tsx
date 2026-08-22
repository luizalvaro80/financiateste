import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Users, UserCheck, UserX, AlertTriangle, Clock, Search, Download, CheckCircle, Ban, CreditCard, RefreshCw, Pencil } from "lucide-react";
import type { UserProfile } from "@/hooks/useUserProfile";

export function ClientManagement() {
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', whatsapp_number: '', subscription_due_date: '', status: '' });
  const { toast } = useToast();

  const openEditDialog = (client: UserProfile) => {
    setEditingClient(client);
    setEditForm({
      name: client.name || '',
      email: client.email || '',
      whatsapp_number: client.whatsapp_number || '',
      subscription_due_date: client.subscription_due_date ? client.subscription_due_date.split('T')[0] : '',
      status: client.status,
    });
  };

  const saveEdit = async () => {
    if (!editingClient) return;
    setActionLoading(editingClient.user_id);
    const updates: Record<string, any> = {
      name: editForm.name,
      email: editForm.email,
      whatsapp_number: editForm.whatsapp_number || null,
      status: editForm.status,
      subscription_due_date: editForm.subscription_due_date ? new Date(editForm.subscription_due_date + 'T12:00:00').toISOString() : null,
    };
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', editingClient.user_id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Dados atualizados!" });
      setEditingClient(null);
      fetchClients();
    }
    setActionLoading(null);
  };

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar clientes", description: error.message, variant: "destructive" });
    } else {
      setClients((data || []) as UserProfile[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  const updateClientStatus = async (userId: string, updates: Record<string, any>, successMsg: string) => {
    setActionLoading(userId);
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: successMsg });
      fetchClients();
    }
    setActionLoading(null);
  };

  const approveClient = (userId: string) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    updateClientStatus(userId, {
      status: 'ATIVO',
      approved: true,
      subscription_due_date: dueDate.toISOString(),
    }, "Cliente aprovado com sucesso!");
  };

  const markAsPaid = (userId: string) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    updateClientStatus(userId, {
      status: 'ATIVO',
      last_payment_date: new Date().toISOString(),
      subscription_due_date: dueDate.toISOString(),
    }, "Pagamento registrado!");
  };

  const blockClient = (userId: string) => {
    updateClientStatus(userId, { status: 'BLOQUEADO' }, "Cliente bloqueado.");
  };

  const reactivateClient = (userId: string) => {
    updateClientStatus(userId, { status: 'ATIVO' }, "Cliente reativado!");
  };

  const markDefaulter = (userId: string) => {
    updateClientStatus(userId, { status: 'INADIMPLENTE' }, "Marcado como inadimplente.");
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'ATIVO').length,
    pending: clients.filter(c => c.status === 'PENDENTE').length,
    defaulter: clients.filter(c => c.status === 'INADIMPLENTE').length,
    blocked: clients.filter(c => c.status === 'BLOQUEADO').length,
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { color: string; label: string }> = {
      PENDENTE: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "Pendente" },
      ATIVO: { color: "bg-green-500/20 text-green-400 border-green-500/30", label: "Ativo" },
      INADIMPLENTE: { color: "bg-red-500/20 text-red-400 border-red-500/30", label: "Inadimplente" },
      BLOQUEADO: { color: "bg-gray-500/20 text-gray-400 border-gray-500/30", label: "Bloqueado" },
    };
    const s = map[status] || map.PENDENTE;
    return <Badge className={`${s.color} border`}>{s.label}</Badge>;
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const isDueToday = (date: string | null) => {
    if (!date) return false;
    const d = new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  };

  const isOverdue = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const exportToCSV = () => {
    const headers = ["Nome", "Email", "Status", "Vencimento", "Último Pagamento", "Cadastro"];
    const rows = filteredClients.map(c => [
      c.name, c.email, c.status,
      formatDate(c.subscription_due_date),
      formatDate(c.last_payment_date),
      formatDate(c.created_at)
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exportado!", description: "Arquivo CSV gerado com sucesso." });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-card/50 border-primary/20">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-green-500/20">
          <CardContent className="p-4 text-center">
            <UserCheck className="h-6 w-6 mx-auto mb-1 text-green-400" />
            <p className="text-2xl font-bold text-green-400">{stats.active}</p>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-1 text-yellow-400" />
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-red-500/20">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-red-400" />
            <p className="text-2xl font-bold text-red-400">{stats.defaulter}</p>
            <p className="text-xs text-muted-foreground">Inadimplentes</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-gray-500/20">
          <CardContent className="p-4 text-center">
            <Ban className="h-6 w-6 mx-auto mb-1 text-gray-400" />
            <p className="text-2xl font-bold text-gray-400">{stats.blocked}</p>
            <p className="text-xs text-muted-foreground">Bloqueados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card/50 border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ATIVO">Ativos</SelectItem>
                <SelectItem value="PENDENTE">Pendentes</SelectItem>
                <SelectItem value="INADIMPLENTE">Inadimplentes</SelectItem>
                <SelectItem value="BLOQUEADO">Bloqueados</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-1" /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={fetchClients}>
                <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Table */}
      <Card className="bg-card/50 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Clientes ({filteredClients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Carregando...</p>
          ) : filteredClients.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhum cliente encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Últ. Pagamento</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id} className={
                      isOverdue(client.subscription_due_date) && client.status === 'ATIVO'
                        ? 'bg-red-500/5'
                        : isDueToday(client.subscription_due_date)
                        ? 'bg-yellow-500/5'
                        : ''
                    }>
                      <TableCell className="font-medium">{client.name || "Sem nome"}</TableCell>
                      <TableCell className="text-sm">{client.email}</TableCell>
                      <TableCell>{getStatusBadge(client.status)}</TableCell>
                      <TableCell className={`text-sm ${
                        isOverdue(client.subscription_due_date) ? 'text-red-400 font-semibold' :
                        isDueToday(client.subscription_due_date) ? 'text-yellow-400 font-semibold' : ''
                      }`}>
                        {formatDate(client.subscription_due_date)}
                        {isDueToday(client.subscription_due_date) && " ⚠️"}
                        {isOverdue(client.subscription_due_date) && client.status !== 'INADIMPLENTE' && " 🔴"}
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(client.last_payment_date)}</TableCell>
                      <TableCell className="text-sm">{formatDate(client.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Button size="sm" variant="outline"
                            className="text-primary border-primary/30 hover:bg-primary/10 text-xs h-7"
                            onClick={() => openEditDialog(client)}
                          >
                            <Pencil className="h-3 w-3 mr-1" /> Editar
                          </Button>
                          {client.status === 'PENDENTE' && (
                            <Button size="sm" variant="outline"
                              className="text-green-400 border-green-500/30 hover:bg-green-500/10 text-xs h-7"
                              onClick={() => approveClient(client.user_id)}
                              disabled={actionLoading === client.user_id}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" /> Aprovar
                            </Button>
                          )}
                          {(client.status === 'INADIMPLENTE' || client.status === 'ATIVO') && (
                            <Button size="sm" variant="outline"
                              className="text-primary border-primary/30 hover:bg-primary/10 text-xs h-7"
                              onClick={() => markAsPaid(client.user_id)}
                              disabled={actionLoading === client.user_id}
                            >
                              <CreditCard className="h-3 w-3 mr-1" /> Pago
                            </Button>
                          )}
                          {client.status !== 'BLOQUEADO' && (
                            <Button size="sm" variant="outline"
                              className="text-gray-400 border-gray-500/30 hover:bg-gray-500/10 text-xs h-7"
                              onClick={() => blockClient(client.user_id)}
                              disabled={actionLoading === client.user_id}
                            >
                              <Ban className="h-3 w-3 mr-1" /> Bloquear
                            </Button>
                          )}
                          {(client.status === 'BLOQUEADO' || client.status === 'INADIMPLENTE') && (
                            <Button size="sm" variant="outline"
                              className="text-green-400 border-green-500/30 hover:bg-green-500/10 text-xs h-7"
                              onClick={() => reactivateClient(client.user_id)}
                              disabled={actionLoading === client.user_id}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" /> Reativar
                            </Button>
                          )}
                          {client.status === 'ATIVO' && (
                            <Button size="sm" variant="outline"
                              className="text-red-400 border-red-500/30 hover:bg-red-500/10 text-xs h-7"
                              onClick={() => markDefaulter(client.user_id)}
                              disabled={actionLoading === client.user_id}
                            >
                              <AlertTriangle className="h-3 w-3 mr-1" /> Inadimplente
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={editForm.email} onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input value={editForm.whatsapp_number} onChange={(e) => setEditForm(f => ({ ...f, whatsapp_number: e.target.value }))} placeholder="11999999999" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="ATIVO">Ativo</SelectItem>
                  <SelectItem value="INADIMPLENTE">Inadimplente</SelectItem>
                  <SelectItem value="BLOQUEADO">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data de Vencimento</Label>
              <Input type="date" value={editForm.subscription_due_date} onChange={(e) => setEditForm(f => ({ ...f, subscription_due_date: e.target.value }))} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingClient(null)}>Cancelar</Button>
              <Button onClick={saveEdit} disabled={actionLoading === editingClient?.user_id}>
                {actionLoading === editingClient?.user_id ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
