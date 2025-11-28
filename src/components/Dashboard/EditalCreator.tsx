import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link as LinkIcon, FileText, X, Loader2 } from 'lucide-react';
import { useEdital } from '@/contexts/EditalContext';
import { useProcessing } from '@/contexts/ProcessingContext';
import { toast } from 'sonner';

interface EditalCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditalCreator = ({ open, onOpenChange }: EditalCreatorProps) => {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createFromUrl, createFromPdf } = useEdital();
  const { startMonitoring } = useProcessing();

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Por favor, insira uma URL válida');
      return;
    }

    setIsSubmitting(true);
    try {
      const job = await createFromUrl(url);
      toast.success('Edital criado com sucesso! Processamento iniciado.');
      startMonitoring(job.editalId);
      setUrl('');
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao criar edital. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Por favor, selecione um arquivo PDF');
      return;
    }

    setIsSubmitting(true);
    try {
      const job = await createFromPdf(file);
      toast.success('Edital criado com sucesso! Processamento iniciado.');
      startMonitoring(job.editalId);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao criar edital. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Por favor, selecione um arquivo PDF');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      toast.error('Por favor, solte um arquivo PDF');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Edital</DialogTitle>
          <DialogDescription>
            Adicione um edital através de URL ou upload de PDF
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">
              <LinkIcon className="h-4 w-4 mr-2" />
              URL
            </TabsTrigger>
            <TabsTrigger value="pdf">
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL do Edital</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.gov.br/edital/001"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" disabled={isSubmitting || !url.trim()} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Criar Edital
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="pdf" className="space-y-4">
            <form onSubmit={handleFileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Arquivo PDF</Label>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {file ? (
                    <div className="space-y-2">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remover
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium">
                        Clique para selecionar ou arraste o arquivo PDF
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Máximo 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting || !file} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar PDF
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

