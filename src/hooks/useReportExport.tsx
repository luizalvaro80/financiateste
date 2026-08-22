import { useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Transaction } from '@/types/finance';
import { useToast } from '@/hooks/use-toast';

export function useReportExport() {
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const exportToPDF = useCallback(async (
    transactions: Transaction[],
    startDate?: string,
    endDate?: string
  ) => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Relatório Financeiro', pageWidth / 2, 20, { align: 'center' });
      
      // Period info
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const period = startDate && endDate 
        ? `Período: ${new Date(startDate).toLocaleDateString('pt-BR')} - ${new Date(endDate).toLocaleDateString('pt-BR')}`
        : 'Período: Todos os registros';
      pdf.text(period, pageWidth / 2, 30, { align: 'center' });
      
      // Generate date
      pdf.setFontSize(10);
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 35, { align: 'center' });

      // Summary calculations
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const balance = totalIncome - totalExpense;

      // Summary section
      let currentY = 50;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Resumo Financeiro', 20, currentY);
      
      currentY += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Receitas: ${formatCurrency(totalIncome)}`, 20, currentY);
      
      currentY += 7;
      pdf.text(`Despesas: ${formatCurrency(totalExpense)}`, 20, currentY);
      
      currentY += 7;
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Saldo: ${formatCurrency(balance)}`, 20, currentY);

      // Transactions table
      currentY += 20;
      pdf.setFontSize(14);
      pdf.text('Transações', 20, currentY);
      
      currentY += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      
      // Table headers
      const colWidths = [30, 45, 25, 30, 40, 20];
      const startX = 20;
      let currentX = startX;
      
      pdf.text('Data', currentX, currentY);
      currentX += colWidths[0];
      pdf.text('Descrição', currentX, currentY);
      currentX += colWidths[1];
      pdf.text('Tipo', currentX, currentY);
      currentX += colWidths[2];
      pdf.text('Categoria', currentX, currentY);
      currentX += colWidths[3];
      pdf.text('Conta', currentX, currentY);
      currentX += colWidths[4];
      pdf.text('Valor', currentX, currentY);
      
      currentY += 5;
      pdf.line(20, currentY, pageWidth - 20, currentY);
      currentY += 5;

      // Table rows
      pdf.setFont('helvetica', 'normal');
      transactions.forEach((transaction, index) => {
        if (currentY > pageHeight - 20) {
          pdf.addPage();
          currentY = 20;
        }

        currentX = startX;
        pdf.text(new Date(transaction.date).toLocaleDateString('pt-BR'), currentX, currentY);
        currentX += colWidths[0];
        
        const description = transaction.description.length > 20 
          ? transaction.description.substring(0, 20) + '...' 
          : transaction.description;
        pdf.text(description, currentX, currentY);
        currentX += colWidths[1];
        
        pdf.text(transaction.type === 'income' ? 'Receita' : 'Despesa', currentX, currentY);
        currentX += colWidths[2];
        
        const category = transaction.category.length > 15 
          ? transaction.category.substring(0, 15) + '...' 
          : transaction.category;
        pdf.text(category, currentX, currentY);
        currentX += colWidths[3];
        
        const account = transaction.account.length > 18 
          ? transaction.account.substring(0, 18) + '...' 
          : transaction.account;
        pdf.text(account, currentX, currentY);
        currentX += colWidths[4];
        
        pdf.text(formatCurrency(transaction.amount), currentX, currentY);
        
        currentY += 5;
      });

      // Try to capture charts if available
      const chartsElement = document.getElementById('financial-charts');
      if (chartsElement) {
        try {
          pdf.addPage();
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Gráficos', 20, 20);
          
          const canvas = await html2canvas(chartsElement, {
            scale: 2,
            backgroundColor: '#ffffff',
            allowTaint: true,
            useCORS: true,
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 40;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          if (imgHeight > pageHeight - 40) {
            const ratio = (pageHeight - 40) / imgHeight;
            pdf.addImage(imgData, 'PNG', 20, 30, imgWidth * ratio, (pageHeight - 40));
          } else {
            pdf.addImage(imgData, 'PNG', 20, 30, imgWidth, imgHeight);
          }
        } catch (error) {
          console.warn('Não foi possível capturar os gráficos:', error);
        }
      }

      // Save PDF
      const fileName = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "PDF exportado com sucesso!",
        description: `Arquivo ${fileName} foi baixado.`,
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Ocorreu um erro ao gerar o relatório em PDF.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const printReport = useCallback(() => {
    try {
      const printContent = document.getElementById('financial-report');
      if (!printContent) {
        toast({
          title: "Erro ao imprimir",
          description: "Conteúdo do relatório não encontrado.",
          variant: "destructive"
        });
        return;
      }

      const originalContent = document.body.innerHTML;
      const printableContent = `
        <html>
          <head>
            <title>Relatório Financeiro</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .print-header { text-align: center; margin-bottom: 30px; }
              .print-summary { margin-bottom: 30px; }
              .print-table { width: 100%; border-collapse: collapse; }
              .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .print-table th { background-color: #f2f2f2; }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printableContent);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
      
      toast({
        title: "Preparando impressão",
        description: "A janela de impressão foi aberta.",
      });
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      toast({
        title: "Erro ao imprimir",
        description: "Ocorreu um erro ao preparar a impressão.",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    exportToPDF,
    printReport
  };
}