export interface OpaEvaluationResult {
    allowed: boolean;
    reason?: string;
}
export declare class OpaClient {
    private readonly logger;
    private readonly baseUrl;
    constructor(baseUrl?: string);
    evaluate(rule: string, input: unknown): Promise<OpaEvaluationResult>;
}
//# sourceMappingURL=opa-client.service.d.ts.map