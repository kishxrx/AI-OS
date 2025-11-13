import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsObject,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/* ---------------------------------------
 * Address DTO
 * --------------------------------------- */
export class AddressDto {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  street: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'State or province' })
  @IsString()
  state: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  postalCode: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  country: string;
}

/* ---------------------------------------
 * Audit DTO
 * --------------------------------------- */
export class AuditDto {
  @ApiProperty({ description: 'Timestamp of creation', type: 'string', format: 'date-time' })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp of last update', type: 'string', format: 'date-time' })
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}

/* ---------------------------------------
 * Property Statistics DTO
 * --------------------------------------- */
export class PropertyStatisticsDto {
  @ApiProperty({ description: 'Number of units in the property', default: 0 })
  @IsNumber()
  unitCount: number;

  @ApiProperty({ description: 'Number of floors in the property', default: 0 })
  @IsNumber()
  floorCount: number;
}

/* ---------------------------------------
 * Property Status Enum
 * --------------------------------------- */
export enum PropertyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

/* ---------------------------------------
 * Property DTO
 * --------------------------------------- */
export class PropertyDto {
  @ApiProperty({ description: 'Name of the property' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Type of the property (e.g., Apartment, House)' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Primary image URL of the property', required: false })
  @IsOptional()
  @IsString()
  primaryImageUrl?: string;

  @ApiProperty({ type: () => AddressDto, description: 'Address of the property' })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({ description: 'ID of the owner' })
  @IsString()
  ownerId: string;

  @ApiProperty({
    enum: PropertyStatus,
    description: 'Current status of the property',
    default: PropertyStatus.ACTIVE,
  })
  @IsEnum(PropertyStatus)
  status: PropertyStatus = PropertyStatus.ACTIVE;

  @ApiProperty({ type: () => PropertyStatisticsDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyStatisticsDto)
  statistics?: PropertyStatisticsDto;

  @ApiProperty({ type: [String], description: 'List of amenities', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiProperty({ type: () => AuditDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AuditDto)
  audit?: AuditDto;
}

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
export class UnitDto {
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
    type: 'object',
    description: 'Flexible specifications object',
    required: false,
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  specs?: Record<string, any>;

  @ApiProperty({ type: () => AuditDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AuditDto)
  audit?: AuditDto;
}