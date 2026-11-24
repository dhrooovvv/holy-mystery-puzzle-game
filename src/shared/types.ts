export type Mode = 'demo' | 'daily';
export type Evidence = { day: number; title: string; detail: string; time: string };
export type Chapter = { day: number; title: string; hook: string; objective: string };
export type GameState = {
  mode: Mode; unlockedDay: number; completed: number[]; hints: Record<string, number>;
  streak: number; serverTime: string; nextUnlockAt: string | null; evidence: Evidence[];
  chapters: Chapter[]; storage: 'local' | 'reddit'; votes: Record<string,string>;
  metrics: Record<string,{attempts:number;startedAt:string;completedAt?:string}>;
};
export type ChapterData = Chapter & {clues: string[]; footage?:string[]; note?:string; choices?:{id:string;label:string}[]};
export type AttemptResult = {correct:boolean; message:string; state?:GameState; evidence?:Evidence; reveal?:string};
export type VoteResult = {choice:string; total:number; counts:Record<string,number>; options:{id:string;label:string}[]};
