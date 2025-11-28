import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertCircle, FileText, ExternalLink, Save, X } from 'lucide-react';
import { updateQuestion } from '@/services/api';
import { toast } from 'sonner';

interface Source {
  type: string;
  section?: string;
  content?: string;
  page?: number;
  document?: string;
  relevance?: string;
  excerpt?: string;
}

interface AIAnswer {
  text: string;
  confidence: number;
  sources: Source[];
  generatedAt: string;
}

interface HumanAnswer {
  text: string;
  editedAt: string;
  editor: string;
  revision: number;
}

interface Question {
  id: string;
  questionText: string;
  section: string;
  category: string;
  importance: string;
  aiAnswer: AIAnswer;
  humanAnswer: HumanAnswer | null;
  status: string;
  flags: string[];
}

interface AnswerEditorProps {
  question: Question | null;
  onUpdate: () => void;
}

export const AnswerEditor = ({ question, onUpdate }: AnswerEditorProps) => {
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [saving, setSaving] = useState(false);

  if (!question) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Selecione uma pergunta para visualizar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleEdit = () => {
    setEditedText(question.humanAnswer?.text || question.aiAnswer.text);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!editedText.trim()) {
      toast.error('A resposta não pode estar vazia');
      return;
    }

    setSaving(true);
    try {
      await updateQuestion(question.id, {
        humanAnswer: editedText,
        status: 'reviewed',
      });
      toast.success('Resposta salva com sucesso!');
      setEditing(false);
      onUpdate();
    } catch (error) {
      toast.error('Erro ao salvar resposta');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditedText('');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.6) return 'Média';
    return 'Baixa';
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg mb-2 break-words">{question.questionText}</CardTitle>
              <CardDescription>
                {question.section} • {question.category}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {question.importance === 'high' && (
                <Badge variant="destructive">Alta Importância</Badge>
              )}
              <Badge variant="outline">{question.category}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto space-y-6">
          {/* AI Answer Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Resposta da IA
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getConfidenceColor(question.aiAnswer.confidence)}>
                  {getConfidenceLabel(question.aiAnswer.confidence)} Confiança
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {(question.aiAnswer.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg overflow-hidden">
              <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">{question.aiAnswer.text}</p>
            </div>
            <Progress value={question.aiAnswer.confidence * 100} className="h-2" />
          </div>

          <Separator />

          {/* Human Answer Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                {question.humanAnswer ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
                Resposta Editada
              </h3>
              {question.humanAnswer && (
                <div className="text-xs text-muted-foreground">
                  Editado por {question.humanAnswer.editor} • Revisão {question.humanAnswer.revision}
                </div>
              )}
            </div>

            {editing ? (
              <div className="space-y-3">
                <Textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="min-h-[200px]"
                  placeholder="Digite sua resposta editada..."
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {question.humanAnswer ? (
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800 overflow-hidden">
                    <p className="text-sm whitespace-pre-wrap break-words">{question.humanAnswer.text}</p>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-muted-foreground">
                      Nenhuma edição realizada. A resposta da IA será usada.
                    </p>
                  </div>
                )}
                <Button onClick={handleEdit} variant="outline" className="w-full">
                  {question.humanAnswer ? 'Editar Resposta' : 'Adicionar Resposta Editada'}
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Sources Section */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Fontes e Referências
            </h3>
            <div className="space-y-2">
              {question.aiAnswer.sources.map((source, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {source.type === 'edital' ? 'Edital' : 'Empresa'}
                        </Badge>
                        {source.section && (
                          <span className="text-xs text-muted-foreground">
                            {source.section}
                          </span>
                        )}
                        {source.page && (
                          <span className="text-xs text-muted-foreground">
                            Página {source.page}
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-1">{source.content || source.excerpt}</p>
                      {source.document && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {source.document}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Status Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant={question.status === 'approved' ? 'default' : 'outline'}
              className="flex-1"
              onClick={async () => {
                try {
                  await updateQuestion(question.id, { status: 'approved' });
                  toast.success('Pergunta aprovada!');
                  onUpdate();
                } catch (error) {
                  toast.error('Erro ao aprovar pergunta');
                }
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Aprovar
            </Button>
            <Button
              variant={question.status === 'needs_review' ? 'destructive' : 'outline'}
              className="flex-1"
              onClick={async () => {
                try {
                  await updateQuestion(question.id, { status: 'needs_review' });
                  toast.success('Marcado para revisão');
                  onUpdate();
                } catch (error) {
                  toast.error('Erro ao marcar para revisão');
                }
              }}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Revisar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

