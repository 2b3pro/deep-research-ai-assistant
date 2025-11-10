import React from 'react';
import { ResearchStep, AppState } from '../types';
import { CheckCircle2, Loader2, FileClock, BrainCircuit, Bot, PenSquare } from 'lucide-react';

interface ResearchProgressProps {
  plan: ResearchStep[];
  appState: AppState;
}

const statusIcon = (status: ResearchStep['status']) => {
  switch (status) {
    case 'pending':
      return <FileClock className="w-5 h-5 text-slate-400" />;
    case 'inprogress':
      return <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />;
    case 'complete':
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
  }
};

const getOverallStatusText = (appState: AppState) => {
    switch (appState) {
        case AppState.AUTHORING_DIRECTIVE:
            return { text: 'Authoring custom research directive...', icon: <PenSquare className="w-6 h-6 mr-3 text-indigo-500 animate-pulse" /> };
        case AppState.PLANNING:
            return { text: 'Generating research plan...', icon: <BrainCircuit className="w-6 h-6 mr-3 text-indigo-500 animate-pulse" /> };
        case AppState.RESEARCHING:
            return { text: 'Executing research steps...', icon: <Loader2 className="w-6 h-6 mr-3 animate-spin text-indigo-500" /> };
        case AppState.GENERATING_REPORT:
            return { text: 'Synthesizing Knowledge Report...', icon: <Bot className="w-6 h-6 mr-3 text-indigo-500 animate-pulse" /> };
        default:
            return { text: 'Starting research...', icon: <Loader2 className="w-6 h-6 mr-3 animate-spin text-indigo-500" /> };
    }
}

const ResearchProgress: React.FC<ResearchProgressProps> = ({ plan, appState }) => {
  const {text, icon} = getOverallStatusText(appState);
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 w-full animate-fade-in">
        <div className="flex items-center justify-center text-lg font-semibold mb-6 text-slate-700 dark:text-slate-300">
            {icon}
            <span>{text}</span>
        </div>
      <ul className="space-y-4">
        {appState !== AppState.AUTHORING_DIRECTIVE && plan.length === 0 && (
             <li className="text-center text-slate-500 dark:text-slate-400">Waiting for research plan...</li>
        )}
        {plan.map((step, index) => (
          <li key={index} className="flex items-start p-3 bg-slate-100 dark:bg-slate-900/50 rounded-md transition-all">
            <div className="mr-4 flex-shrink-0 pt-1">
                {statusIcon(step.status)}
            </div>
            <div className="flex-grow">
              <p className={`font-medium ${step.status === 'complete' ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                {step.task}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResearchProgress;