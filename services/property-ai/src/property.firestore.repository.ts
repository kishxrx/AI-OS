import { Inject, Injectable, Logger } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import {
  CreatePropertyDto,
  IPropertyRepository,
  PropertyDto,
  PropertyStatus,
} from '@app/common-types';
import { FIRESTORE } from './firestore.provider';

@Injectable()
export class PropertyFirestoreRepository implements IPropertyRepository {
  private readonly logger = new Logger(PropertyFirestoreRepository.name);
  private readonly collection: string = 'properties'; // Firestore collection name

  constructor(@Inject(FIRESTORE) private firestore: Firestore) {}

  async create(property: CreatePropertyDto): Promise<PropertyDto> {
    try {
      const docRef = this.firestore.collection(this.collection).doc();
      const newProperty = { ...property, id: docRef.id };

      await docRef.set(newProperty);
      this.logger.log(`Property created with ID: ${docRef.id}`);
      return newProperty;
    } catch (error) {
      this.logger.error(`Error creating property: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<PropertyDto | null> {
    try {
      const doc = await this.firestore.collection(this.collection).doc(id).get();
      if (!doc.exists) {
        this.logger.warn(`Property with ID ${id} not found.`);
        return null;
      }
      return doc.data() as PropertyDto;
    } catch (error) {
      this.logger.error(`Error finding property by ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<PropertyDto[]> {
    try {
      const snapshot = await this.firestore.collection(this.collection).get();
      return snapshot.docs.map((doc) => doc.data() as PropertyDto);
    } catch (error) {
      this.logger.error(`Error finding all properties: ${error.message}`);
      throw error;
    }
  }

  async findByName(name: string): Promise<PropertyDto[]> {
  try {
    this.logger.log(`Searching for properties with name: "${name}"`);

    const snapshot = await this.firestore
      .collection(this.collection)
      .where('name', '==', name) // Query for exact match
      .get();

    const properties = snapshot.docs.map(doc => doc.data() as PropertyDto);

    this.logger.log(`Found ${properties.length} properties matching name: "${name}"`);
    return properties;
  } catch (error) {
    this.logger.error(`Error finding properties by name "${name}": ${error.message}`);
    throw error;
  }
}


  async update(id: string, property: Partial<PropertyDto>): Promise<PropertyDto> {
    try {
      const docRef = this.firestore.collection(this.collection).doc(id);
      await docRef.update(property);
      this.logger.log(`Property with ID ${id} updated.`);
      const updatedDoc = await docRef.get();
      return updatedDoc.data() as PropertyDto;
    } catch (error) {
      this.logger.error(`Error updating property with ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.firestore.collection(this.collection).doc(id).delete();
      this.logger.log(`Property with ID ${id} hard deleted.`);
    } catch (error) {
      this.logger.error(`Error hard deleting property with ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async logicalDelete(id: string): Promise<void> {
    try {
      const docRef = this.firestore.collection(this.collection).doc(id);
      await docRef.update({ status: PropertyStatus.LOGICALLY_DELETED });
      this.logger.log(`Property with ID ${id} logically deleted.`);
    } catch (error) {
      this.logger.error(`Error logically deleting property with ID ${id}: ${error.message}`);
      throw error;
    }
  }
}
