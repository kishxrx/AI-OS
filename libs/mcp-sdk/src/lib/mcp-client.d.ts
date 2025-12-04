export type Ministry = 'property' | 'finance' | 'legal';
export interface McpCheckResult {
    ministry: Ministry;
    cleared: boolean;
    details: string;
}
export interface McpActionResult {
    success: boolean;
    details: string;
}
export declare class McpClient {
    private readonly logger;
    private readonly endpoints;
    constructor(endpoints?: Partial<Record<Ministry, string>>);
    askMinistry(ministry: Ministry, action: string, payload: unknown): Promise<McpCheckResult>;
    executeMinistryAction(ministry: Ministry, action: string, payload: unknown): Promise<McpActionResult>;
}
//# sourceMappingURL=mcp-client.d.ts.map