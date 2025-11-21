import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/* ---------------------------------------
 * Address DTO
 * --------------------------------------- */
export class AddressDto {
  @ApiProperty({ description: 'State or province' })
  @IsString()
  state: string;

  @ApiProperty({ description: 'Pincode' })
  @IsString()
  pincode: string;

  @ApiProperty({ description: 'Address Line 1' })
  @IsString()
  addressLine1: string;

  @ApiProperty({ description: 'Address Line 2', required: false })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  country: string;
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
  LOGICALLY_DELETED = 'LOGICALLY_DELETED',
}

/* ---------------------------------------
 * Create Property DTO (for input)
 * --------------------------------------- */
export class CreatePropertyDto {
  @ApiProperty({ description: 'Name of the property' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Type of the property (e.g., Apartment, House)' })
  @IsString()
  type: string;

  @ApiProperty({
    type: [String],
    description: 'Array of image URLs for the property',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiProperty({
    type: () => AddressDto,
    description: 'Address of the property',
  })
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

  @ApiProperty({
    type: () => PropertyStatisticsDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyStatisticsDto)
  statistics?: PropertyStatisticsDto;

  @ApiProperty({
    type: [String],
    description: 'List of amenities',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];
}

/* ---------------------------------------
 * Property DTO (for output/response)
 * --------------------------------------- */
export class PropertyDto extends CreatePropertyDto {
  @ApiProperty({ description: 'Unique identifier of the property' })
  @IsString()
  id: string;
}
