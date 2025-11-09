import React, { useState, useCallback } from 'react';
import { ResearchStep, AppState, ResearchResult } from './types';
import { authorResearchDirective, generateResearchPlan, executeResearchStep, generateKnowledgeReport } from './services/geminiService';
import TopicInput from './components/TopicInput';
import ResearchProgress from './components/ResearchProgress';
import ReportDisplay from './components/ReportDisplay';
import { Bot, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [subject, setSubject] = useState<string>('');
  const [plan, setPlan] = useState<ResearchStep[]>([]);
  const [researchData, setResearchData] = useState<ResearchResult[]>([]);
  const [report, setReport] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setAppState(AppState.IDLE);
    setSubject('');
    setPlan([]);
    setResearchData([]);
    setReport('');
    setError(null);
  };

  const handleStartResearch = useCallback(async ({ subject, notes }: { subject: string; notes: string }) => {
    if (!subject.trim()) {
      setError("Please enter a research subject.");
      return;
    }
    resetState();
    setSubject(subject);
    
    try {
      // Step 1: Author the custom research directive
      setAppState(AppState.AUTHORING_DIRECTIVE);
      const authoredDirective = await authorResearchDirective(subject, notes);

      // Step 2: Generate Research Plan based on the directive
      setAppState(AppState.PLANNING);
      const researchPlan = await generateResearchPlan(authoredDirective);
      const initialPlan: ResearchStep[] = researchPlan.map(step => ({
        task: step,
        status: 'pending'
      }));
      setPlan(initialPlan);

      // Step 3: Execute Research for each step in the plan, guided by the directive
      setAppState(AppState.RESEARCHING);
      const collectedData: ResearchResult[] = [];
      for (let i = 0; i < researchPlan.length; i++) {
        setPlan(prevPlan => prevPlan.map((step, index) => index === i ? { ...step, status: 'inprogress' } : step));
        
        const { summary, sources } = await executeResearchStep(subject, researchPlan[i], authoredDirective);
        
        collectedData.push({
          task: researchPlan[i],
          summary,
          sources: sources || [],
        });

        setResearchData([...collectedData]);
        setPlan(prevPlan => prevPlan.map((step, index) => index === i ? { ...step, status: 'complete' } : step));
      }
      
      // Step 4: Generate the Knowledge Report
      setAppState(AppState.GENERATING_REPORT);
      const finalReport = await generateKnowledgeReport(subject, collectedData);
      setReport(finalReport);
      setAppState(AppState.COMPLETE);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during research.");
      setAppState(AppState.ERROR);
    }
  }, []);
  

  const renderContent = () => {
    switch (appState) {
      case AppState.IDLE:
      case AppState.ERROR:
        return <TopicInput onStartResearch={handleStartResearch} loading={appState !== AppState.IDLE} error={error} />;
      case AppState.AUTHORING_DIRECTIVE:
      case AppState.PLANNING:
      case AppState.RESEARCHING:
      case AppState.GENERATING_REPORT:
        return (
          <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-200 mb-4">Researching: {subject}</h2>
            <ResearchProgress plan={plan} appState={appState} />
          </div>
        );
      case AppState.COMPLETE:
        return <ReportDisplay report={report} subject={subject} onStartNewSearch={resetState} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-2">
            <Bot className="w-10 h-10 text-indigo-500" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
                Deep Research Assistant
            </h1>
        </div>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Leverage Gemini to author a custom research plan and generate a comprehensive, source-grounded knowledge report.
        </p>
      </header>
      <main className="flex flex-col items-center justify-center">
        {renderContent()}
      </main>
      <footer className="text-center mt-12 text-sm text-slate-500 dark:text-slate-500">
        <p>Powered by Google Gemini <Zap className="inline w-4 h-4" /></p>
      </footer>
    </div>
  );
};

export default App;