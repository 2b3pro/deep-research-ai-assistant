export enum AppState {
    IDLE = 'idle',
    AUTHORING_DIRECTIVE = 'authoring_directive',
    PLANNING = 'planning',
    RESEARCHING = 'researching',
    GENERATING_REPORT = 'generating_report',
    COMPLETE = 'complete',
    ERROR = 'error'
}

export type ResearchStepStatus = 'pending' | 'inprogress' | 'complete';

export interface ResearchStep {
    task: string;
    status: ResearchStepStatus;
}

export interface Source {
    uri: string;
    title: string;
}

export interface ResearchResult {
    task: string;
    summary: string;
    sources: Source[];
}