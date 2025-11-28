import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Eye, Clock, FileText, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Edital } from '@/services/api';
import type { EditalStatus } from '@/services/mockData';

interface EditalCardProps {
  edital: Edital;
}

const statusConfig: Record<EditalStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  completed: { label: 'Concluído', variant: 'default' },
  processing: { label: 'Processando', variant: 'secondary' },
  needs_review: { label: 'Revisão', variant: 'destructive' },
  draft: { label: 'Rascunho', variant: 'outline' },
};

const urgencyConfig = {
  high: { label: 'Alta', color: 'text-red-600' },
  medium: { label: 'Média', color: 'text-yellow-600' },
  low: { label: 'Baixa', color: 'text-green-600' },
};

export const EditalCard = ({ edital }: EditalCardProps) => {
  const navigate = useNavigate();
  const status = statusConfig[edital.status];
  const urgency = urgencyConfig[edital.urgency as keyof typeof urgencyConfig];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleView = () => {
    navigate(`/dashboard/editais/${edital.id}`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 line-clamp-2">{edital.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {edital.agency}
            </CardDescription>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Perguntas</p>
              <p className="font-semibold">{edital.questionsCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Confiança</p>
              <div className="flex items-center gap-2">
                <Progress value={edital.confidenceScore * 100} className="flex-1 h-2" />
                <span className="text-xs font-medium">{(edital.confidenceScore * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Value and Urgency */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Valor</p>
              <p className="font-semibold">{formatCurrency(edital.value)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Urgência</p>
              <p className={`font-semibold ${urgency.color}`}>{urgency.label}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Processado
              </p>
              <p className="text-xs">{formatDate(edital.processedAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Prazo</p>
              <p className="text-xs">{formatDate(edital.deadline)}</p>
            </div>
          </div>

          {/* Action Button */}
          <Button onClick={handleView} className="w-full" variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

