export interface LogAuditDto {
  userId?: string;
  userEmail?: string;
  action: string; // use AuditActionType constants or plain string
  resource?: string;
  details?: Record<string, any>;
  severity?: 'INFO' | 'WARN' | 'ERROR';
}
