import { ApiProperty } from '@nestjs/swagger';

export class MaintenanceAnalysisDto {
  /**
   * The category of the maintenance request, as determined by the AI.
   * @example 'Plumbing'
   */
  @ApiProperty({ example: 'Plumbing', description: 'The category of the maintenance request.' })
  category: 'Plumbing' | 'Electrical' | 'Structural' | 'General' | string;

  /**
   * The severity of the issue, as determined by the AI.
   * @example 'High'
   */
  @ApiProperty({ example: 'High', description: 'The severity of the issue.' })
  severity: 'Low' | 'Medium' | 'High' | 'Critical' | string;

  /**
   * The primary entity or object of the request, as determined by the AI.
   * @example 'kitchen sink'
   */
  @ApiProperty({ example: 'kitchen sink', description: 'The primary entity of the request.' })
  entity: string;
}
