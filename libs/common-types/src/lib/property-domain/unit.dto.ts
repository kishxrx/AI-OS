import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/* ---------------------------------------
 * Unit Enums
 * --------------------------------------- */
export enum UnitType {
  FLAT = 'FLAT',
  ROOM = 'ROOM',
  BED = 'BED',
  FLOOR = 'FLOOR',
}

export enum UnitStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
}

/* ---------------------------------------
 * Unit DTO
 * --------------------------------------- */
export class CreateUnitDto { 
  @ApiProperty({ description: 'ID of the Property this unit belongs to' })
  @IsString()
  propertyId: string;

  @ApiProperty({ enum: UnitType, description: 'Type of the unit' })
  @IsEnum(UnitType)
  unitType: UnitType;

  @ApiProperty({ description: 'Human-friendly unit identifier (e.g., A-101)' })
  @IsString()
  unitIdentifier: string;

  @ApiProperty({
    enum: UnitStatus,
    description: 'Current status of the unit',
    default: UnitStatus.AVAILABLE,
  })
  @IsEnum(UnitStatus)
  status: UnitStatus = UnitStatus.AVAILABLE;

  @ApiProperty({
    description: 'Quantity of units (for non-FLAT types)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  quantity?: number; // e.g., 3 beds, 5 rooms, etc.
}

/* ---------------------------------------
 * Unit DTO (for output/response)
 * --------------------------------------- */
export class UnitDto extends CreateUnitDto {
  @ApiProperty({ description: 'Unique identifier of the unit' })
  @IsString()
  id: string;
}
