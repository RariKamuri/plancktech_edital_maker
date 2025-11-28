import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEdital } from '@/contexts/EditalContext';
import { useProcessing } from '@/contexts/ProcessingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ArrowLeft, FileText, CheckCircle2, Clock, AlertCircle, TrendingUp, Download } from 'lucide-react';
import { QuestionList } from '@/components/EditalEditor/QuestionList';
import { AnswerEditor } from '@/components/EditalEditor/AnswerEditor';
import { getProcessingStatus } from '@/services/api';
import { exportEditalToWord } from '@/utils/exportToWord';
import { toast } from 'sonner';

const EditalEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentEdital, loading, fetchEdital, error } = useEdital();
  const { getJobStatus, startMonitoring } = useProcessing();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEdital(id);
    }
  }, [id, fetchEdital]);

  useEffect(() => {
    if (id && currentEdital?.status === 'processing') {
      startMonitoring(id);
      const interval = setInterval(async () => {
        try {
          const status = await getProcessingStatus(id);
          setProcessingStatus(status);
          if (status.progress >= 100) {
            clearInterval(interval);
            setTimeout(() => fetchEdital(id), 1000);
          }
        } catch (error) {
          console.error('Error fetching processing status:', error);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [id, currentEdital?.status, startMonitoring, fetchEdital]);

  useEffect(() => {
    if (currentEdital?.questions && currentEdital.questions.length > 0 && !selectedQuestionId) {
      setSelectedQuestionId(currentEdital.questions[0].id);
    }
  }, [currentEdital, selectedQuestionId]);

  const selectedQuestion = currentEdital?.questions?.find(q => q.id === selectedQuestionId) || null;

  const handleRefresh = () => {
    if (id) {
      fetchEdital(id);
    }
  };

  if (loading && !currentEdital) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando edital...</p>
        </div>
      </div>
    );
  }

  if (error || !currentEdital) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-lg font-medium mb-2">Edital não encontrado</p>
            <p className="text-muted-foreground mb-4">{error || 'O edital solicitado não existe'}</p>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = processingStatus || getJobStatus(currentEdital.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{currentEdital.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {currentEdital.agency}
                    </span>
                    <Badge variant="outline">{currentEdital.documentType}</Badge>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  {currentEdital.status === 'completed' && (
                    <Badge className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Concluído
                    </Badge>
                  )}
                  {currentEdital.status === 'processing' && (
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Processando
                    </Badge>
                  )}
                  {currentEdital.status === 'needs_review' && (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Revisão
                    </Badge>
                  )}
                  {currentEdital.questions && currentEdital.questions.length > 0 && (
                    <Button
                      onClick={async () => {
                        setIsExporting(true);
                        try {
                          await exportEditalToWord(currentEdital);
                          toast.success('Documento Word exportado com sucesso!');
                        } catch (error) {
                          console.error('Error exporting to Word:', error);
                          toast.error(error instanceof Error ? error.message : 'Erro ao exportar documento. Tente novamente.');
                        } finally {
                          setIsExporting(false);
                        }
                      }}
                      variant="outline"
                      className="gap-2"
                      disabled={isExporting}
                    >
                      <Download className={`h-4 w-4 ${isExporting ? 'animate-pulse' : ''}`} />
                      {isExporting ? 'Exportando...' : 'Exportar Word'}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            {currentEdital.status === 'processing' && status && (
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progresso do Processamento</span>
                    <span className="font-medium">{status.progress}%</span>
                  </div>
                  <Progress value={status.progress} className="h-2" />
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Etapa: {status.currentStep}</span>
                    <span>Tempo restante: {status.estimatedTimeRemaining}</span>
                  </div>
                </div>
              </CardContent>
            )}

            {currentEdital.metadata && (
              <CardContent>
                <Separator className="mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Perguntas</p>
                    <p className="text-lg font-bold">{currentEdital.metadata.totalQuestions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Revisadas</p>
                    <p className="text-lg font-bold text-green-600">
                      {currentEdital.metadata.reviewedQuestions}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Confiança Média</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <p className="text-lg font-bold">
                        {(currentEdital.metadata.averageConfidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Progresso</p>
                    <Progress value={currentEdital.metadata.reviewProgress * 100} className="h-2 mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(currentEdital.metadata.reviewProgress * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Editor Interface */}
        {currentEdital.status === 'processing' ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
              <p className="text-lg font-medium mb-2">Processando Edital</p>
              <p className="text-muted-foreground">
                O edital está sendo processado. Aguarde a conclusão para editar as perguntas.
              </p>
            </CardContent>
          </Card>
        ) : currentEdital.questions && currentEdital.questions.length > 0 ? (
          <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-400px)] min-h-[600px]">
            <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
              <QuestionList
                questions={currentEdital.questions}
                selectedQuestionId={selectedQuestionId}
                onSelectQuestion={setSelectedQuestionId}
              />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={70} minSize={50}>
              <AnswerEditor question={selectedQuestion} onUpdate={handleRefresh} />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Nenhuma pergunta encontrada</p>
              <p className="text-muted-foreground">
                Este edital não possui perguntas processadas ainda.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EditalEditor;

