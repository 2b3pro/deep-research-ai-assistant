import React, { useState } from 'react';
import { FileText, RotateCcw, Clipboard, Check, Download } from 'lucide-react';

interface ReportDisplayProps {
  report: string;
  subject: string;
  onStartNewSearch: () => void;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, subject, onStartNewSearch }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `${subject.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-report.md`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename || 'deep-research-report.md');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderMarkdown = (md: string) => {
    let html = '';
    let inList = false;
    let listType = 'ul';

    md.split('\n').forEach(line => {
      // Order of operations is important
      let processedLine = line
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-500 hover:underline">$1</a>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[(\d+)\]/g, '<sup class="text-indigo-400 font-semibold text-xs mx-0.5">[$1]</sup>');

      if (processedLine.startsWith('# ')) {
        if (inList) { html += `</${listType}>`; inList = false; }
        html += `<h1 class="text-3xl font-bold mt-6 mb-3 text-slate-800 dark:text-slate-100">${processedLine.substring(2)}</h1>`;
      } else if (processedLine.startsWith('## ')) {
        if (inList) { html += `</${listType}>`; inList = false; }
        html += `<h2 class="text-2xl font-semibold mt-5 mb-2 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">${processedLine.substring(3)}</h2>`;
      } else if (processedLine.startsWith('### ')) {
        if (inList) { html += `</${listType}>`; inList = false; }
        html += `<h3 class="text-xl font-semibold mt-4 mb-1 text-slate-700 dark:text-slate-200">${processedLine.substring(4)}</h3>`;
      } else if (processedLine.trim().startsWith('- ')) {
        if (!inList || listType !== 'ul') {
          if (inList) html += `</${listType}>`;
          html += '<ul class="list-disc list-inside space-y-2 pl-4">';
          inList = true;
          listType = 'ul';
        }
        html += `<li class="text-slate-600 dark:text-slate-300">${processedLine.trim().substring(2)}</li>`;
      } else if (/^\s*\d+\.\s/.test(processedLine.trim())) {
        if (!inList || listType !== 'ol') {
          if (inList) html += `</${listType}>`;
          html += '<ol class="list-decimal list-inside space-y-2 pl-4">';
          inList = true;
          listType = 'ol';
        }
        html += `<li class="text-slate-600 dark:text-slate-300">${processedLine.trim().replace(/^\d+\.\s/, '')}</li>`;
      } else {
        if (inList) { html += `</${listType}>`; inList = false; }
        if (processedLine.trim() !== '') {
          html += `<p class="my-2 text-slate-600 dark:text-slate-300 leading-relaxed">${processedLine}</p>`;
        }
      }
    });

    if (inList) {
      html += `</${listType}>`;
    }

    return html;
  };

  const reportHtml = renderMarkdown(report);

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="flex items-center mb-4 sm:mb-0">
                <FileText className="w-8 h-8 text-indigo-500 mr-3" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Deep Research Report</h2>
            </div>
            <div className="flex items-center gap-2">
                 <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download .md
                </button>
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Clipboard className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Markdown'}
                </button>
                <button 
                    onClick={onStartNewSearch}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Start New Research
                </button>
            </div>
        </div>
        
        <div 
          className="prose prose-slate dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: reportHtml }}
        />

      </div>
    </div>
  );
};

export default ReportDisplay;