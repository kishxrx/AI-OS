import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreatePropertyDto, I_PROPERTY_REPOSITORY, IPropertyRepository, PropertyDto } from '@app/common-types';
@Injectable()
export class PropertyAiService {
  private readonly logger = new Logger(PropertyAiService.name);

  constructor(
    @Inject(I_PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
  ) {}

  getHello(): string {
    return 'Hello from Property AI Ministry!';
  }

  async createProperty(createPropertyDto: CreatePropertyDto): Promise<PropertyDto> {
  this.logger.log(`Attempting to create property: ${JSON.stringify(createPropertyDto)}`);
  const createdProperty = await this.propertyRepository.create(createPropertyDto);
  this.logger.log(`Property created successfully with ID: ${createdProperty.id}`);
  return createdProperty;
}

async findPropertyById(id: string): Promise<PropertyDto | null> {
this.logger.log(`Attempting to find property with ID: ${id}`);
const property = await this.propertyRepository.findById(id);
if (property) {
this.logger.log(`Found property with ID: ${id}`);
} else {
this.logger.warn(`Property with ID: ${id} not found.`);
}
return property;
}

async findAllProperties(): Promise<PropertyDto[]> {
this.logger.log(`Attempting to find all properties.`);
const properties = await this.propertyRepository.findAll();
this.logger.log(`Found ${properties.length} properties.`);
return properties;
}

async findPropertyByName(name: string): Promise<PropertyDto[]> {
  this.logger.log(`Attempting to find properties by name: "${name}"`);
  const properties = await this.propertyRepository.findByName(name);
  if (properties.length > 0) {
    this.logger.log(`Found ${properties.length} properties with name: "${name}"`);
  } else {
    this.logger.warn(`No properties found with name: "${name}"`);
  }
  return properties;
}

// TODO: Implement update, delete, logicalDelete for properties
}