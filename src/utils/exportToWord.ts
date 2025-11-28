import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

interface Question {
  id: string;
  questionText: string;
  section: string;
  category: string;
  importance: string;
  aiAnswer: {
    text: string;
    confidence: number;
    sources: Array<{
      type: string;
      section?: string;
      content?: string;
      page?: number;
      document?: string;
      excerpt?: string;
    }>;
  };
  humanAnswer: {
    text: string;
    editedAt: string;
    editor: string;
    revision: number;
  } | null;
  status: string;
}

interface Edital {
  id: string;
  title: string;
  agency: string;
  status: string;
  questions?: Question[];
  metadata?: {
    totalQuestions: number;
    reviewedQuestions: number;
    averageConfidence: number;
  };
}

export const exportEditalToWord = async (edital: Edital) => {
  if (!edital.questions || edital.questions.length === 0) {
    throw new Error('Nenhuma pergunta disponível para exportar');
  }
  const children: (Paragraph | Paragraph[])[] = [];

  // Title
  children.push(
    new Paragraph({
      text: edital.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Agency and Info
  children.push(
    new Paragraph({
      text: `Agência: ${edital.agency}`,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: `Status: ${edital.status}`,
      spacing: { after: 200 },
    })
  );

  if (edital.metadata) {
    children.push(
      new Paragraph({
        text: `Total de Perguntas: ${edital.metadata.totalQuestions}`,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: `Perguntas Revisadas: ${edital.metadata.reviewedQuestions}`,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: `Confiança Média: ${(edital.metadata.averageConfidence * 100).toFixed(0)}%`,
        spacing: { after: 400 },
      })
    );
  }

  // Questions Section
  children.push(
    new Paragraph({
      text: 'Perguntas e Respostas',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 300 },
    })
  );

  // Add each question
  edital.questions.forEach((question, index) => {
    // Question Number and Text
    children.push(
      new Paragraph({
        text: `Pergunta ${index + 1}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: question.questionText,
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Seção: ${question.section}`,
            italics: true,
            size: 20,
          }),
        ],
        spacing: { after: 200 },
      })
    );

    // Category and Importance
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Categoria: ${question.category} | `,
            size: 20,
          }),
          new TextRun({
            text: `Importância: ${question.importance} | `,
            size: 20,
          }),
          new TextRun({
            text: `Status: ${question.status}`,
            size: 20,
          }),
        ],
        spacing: { after: 300 },
      })
    );

    // AI Answer
    children.push(
      new Paragraph({
        text: 'Resposta da IA',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Confiança: ${(question.aiAnswer.confidence * 100).toFixed(0)}%`,
            italics: true,
            size: 20,
          }),
        ],
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: question.aiAnswer.text,
        spacing: { after: 300 },
      })
    );

    // Human Answer (if exists)
    if (question.humanAnswer) {
      children.push(
        new Paragraph({
          text: 'Resposta Editada',
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Editado por: ${question.humanAnswer.editor} | `,
              italics: true,
              size: 20,
            }),
            new TextRun({
              text: `Revisão: ${question.humanAnswer.revision}`,
              italics: true,
              size: 20,
            }),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: question.humanAnswer.text,
          spacing: { after: 300 },
        })
      );
    }

    // Sources
    if (question.aiAnswer.sources && question.aiAnswer.sources.length > 0) {
      children.push(
        new Paragraph({
          text: 'Fontes e Referências',
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 200 },
        })
      );

      question.aiAnswer.sources.forEach((source) => {
        const sourceText = [
          source.type === 'edital' ? 'Edital' : 'Empresa',
          source.section && `Seção: ${source.section}`,
          source.page && `Página: ${source.page}`,
          source.document && `Documento: ${source.document}`,
        ]
          .filter(Boolean)
          .join(' | ');

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: sourceText,
                italics: true,
                size: 20,
              }),
            ],
            spacing: { after: 100 },
          })
        );

        if (source.content || source.excerpt) {
          children.push(
            new Paragraph({
              text: source.content || source.excerpt || '',
              spacing: { after: 200 },
            })
          );
        }
      });
    }

    // Separator between questions
    if (index < edital.questions.length - 1) {
      children.push(
        new Paragraph({
          text: '─────────────────────────────────────────────────────────',
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 400 },
        })
      );
    }
  });

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  // Generate and download
  const blob = await Packer.toBlob(doc);
  const fileName = `${edital.title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
  saveAs(blob, fileName);
};

