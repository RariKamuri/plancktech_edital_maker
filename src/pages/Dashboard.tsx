import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { useEdital } from '@/contexts/EditalContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Plus, Search, Filter, TrendingUp, CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react';
import logo from '@/assets/logo.svg';
import { EditalCard } from '@/components/Dashboard/EditalCard';
import { EditalCreator } from '@/components/Dashboard/EditalCreator';
import type { EditalStatus } from '@/services/mockData';

const AGENCIES = ['Todas', 'ANEEL', 'BNDES', 'Ministério da Saúde', 'ANVISA', 'IBAMA', 'ANATEL', 'ANP'];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { editais, loading, stats, fetchEditais } = useEdital();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agencyFilter, setAgencyFilter] = useState<string>('Todas');
  const [page, setPage] = useState(1);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  useEffect(() => {
    fetchEditais({ page, limit: 12, search: searchQuery || undefined, status: statusFilter !== 'all' ? (statusFilter as EditalStatus) : undefined, agency: agencyFilter !== 'Todas' ? agencyFilter : undefined });
  }, [page, fetchEditais]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = () => {
    fetchEditais({
      page: 1,
      limit: 12,
      search: searchQuery || undefined,
      status: statusFilter !== 'all' ? (statusFilter as EditalStatus) : undefined,
      agency: agencyFilter !== 'Todas' ? agencyFilter : undefined,
    });
    setPage(1);
  };

  const handleFilterChange = () => {
    handleSearch();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-12 w-12" />
            <div>
              <h1 className="text-2xl font-bold text-primary">Edital Maker</h1>
              <p className="text-sm text-muted-foreground">Sistema de Criação de Editais</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setIsCreatorOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Edital
            </Button>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{user?.email || user?.username}</p>
              <p className="text-xs text-muted-foreground">Usuário</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Editais processados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">{((stats.completed / stats.total) * 100).toFixed(0)}% do total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processando</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
                <p className="text-xs text-muted-foreground">Em andamento</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revisão</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.needsReview}</div>
                <p className="text-xs text-muted-foreground">Precisam de revisão</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar por título ou agência..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); handleFilterChange(); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="processing">Processando</SelectItem>
                    <SelectItem value="needs_review">Revisão</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Agência</label>
                <Select value={agencyFilter} onValueChange={(value) => { setAgencyFilter(value); handleFilterChange(); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENCIES.map((agency) => (
                      <SelectItem key={agency} value={agency}>
                        {agency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confiança Média</label>
                <div className="flex items-center gap-2 pt-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-bold">
                    {stats ? (stats.averageConfidence * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editais Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando editais...</p>
            </div>
          </div>
        ) : editais.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Nenhum edital encontrado</p>
              <p className="text-muted-foreground mb-4">
                Crie seu primeiro edital para começar
              </p>
              <Button onClick={() => setIsCreatorOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Edital
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {editais.map((edital) => (
              <EditalCard key={edital.id} edital={edital} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {editais.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={editais.length < 12}
            >
              Próxima
            </Button>
          </div>
        )}
      </main>

      {/* Edital Creator Modal */}
      <EditalCreator open={isCreatorOpen} onOpenChange={setIsCreatorOpen} />
    </div>
  );
};

export default Dashboard;
