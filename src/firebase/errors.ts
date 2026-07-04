
/**
 * Contextual data for a security rule violation.
 */
export interface SecurityRuleContext {
  path: string;
  operation: 'read' | 'write' | 'create' | 'update' | 'delete' | 'list' | 'get';
  requestResourceData?: any;
}

/**
 * Custom error class for Firestore permission denials.
 */
export class FirestorePermissionError extends Error {
  context: SecurityRuleContext;
  
  constructor(context: SecurityRuleContext) {
    super(`Permission denied: ${context.operation} on ${context.path}`);
    this.name = 'FirestorePermissionError';
    this.context = context;
  }
}
