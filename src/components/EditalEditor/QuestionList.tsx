import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  questionText: string;
  section: string;
  category: string;
  importance: string;
  status: string;
  aiAnswer: {
    confidence: number;
  };
}

interface QuestionListProps {
  questions: Question[];
  selectedQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const QuestionList = ({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  searchQuery = '',
  onSearchChange,
}: QuestionListProps) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const filteredQuestions = questions.filter(q =>
    q.questionText.toLowerCase().includes(localSearch.toLowerCase()) ||
    q.section.toLowerCase().includes(localSearch.toLowerCase())
  );

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onSearchChange?.(value);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar perguntas..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          {filteredQuestions.length} de {questions.length} perguntas
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredQuestions.map((question) => {
            const isSelected = question.id === selectedQuestionId;

            return (
              <Card
                key={question.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  isSelected
                    ? "bg-green-600 text-white border-green-700 shadow-lg"
                    : "bg-card hover:bg-muted/50"
                )}
                onClick={() => onSelectQuestion(question.id)}
              >
                <div className="p-4 space-y-3">
                  {/* Question Text */}
                  <div>
                    <p className={cn(
                      "font-medium text-base leading-snug",
                      isSelected ? "text-white" : "text-foreground"
                    )}>
                      {question.questionText}
                    </p>
                    <p className={cn(
                      "text-sm mt-1.5",
                      isSelected ? "text-green-100" : "text-muted-foreground"
                    )}>
                      {question.section}
                    </p>
                  </div>

                  {/* Tags and Confidence */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={isSelected ? "secondary" : "outline"}
                      className={cn(
                        "text-xs",
                        isSelected && "bg-green-500 text-white border-green-400"
                      )}
                    >
                      {question.category}
                    </Badge>
                    {question.importance === 'high' && (
                      <Badge
                        variant={isSelected ? "secondary" : "destructive"}
                        className={cn(
                          "text-xs",
                          isSelected && "bg-red-500 text-white border-red-400"
                        )}
                      >
                        Alta
                      </Badge>
                    )}
                    <span className={cn(
                      "text-xs ml-auto",
                      isSelected ? "text-green-100" : "text-muted-foreground"
                    )}>
                      {(question.aiAnswer.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
