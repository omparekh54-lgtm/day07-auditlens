export type ReviewStatus = 'New' | 'Reviewing' | 'Explained' | 'Escalate';
export interface AuditTransaction { id:string; date:string; amount:number; vendor:string; employee:string; category:string; description:string; paymentMethod:string; approver:string; account:string; }
export type SignalKind = 'known' | 'statistical' | 'heuristic';
export interface RiskSignal { code:string; label:string; detail:string; points:number; kind:SignalKind; }
export interface RiskCase { transaction:AuditTransaction; score:number; signals:RiskSignal[]; peerMedian:number; peerMad:number; peerCount:number; }
export interface AuditSummary { transactions:number; totalValue:number; flagged:number; highRiskValue:number; vendors:number; }
export interface PolicyConfig { approvalThreshold:number; weekendRequiresJustification:boolean; }