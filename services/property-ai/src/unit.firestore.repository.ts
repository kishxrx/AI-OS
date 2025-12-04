import { Inject, Injectable, Logger } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import {
  IUnitRepository,
  CreateUnitDto,
  UnitDto,
  UnitStatus,
  I_UNIT_REPOSITORY,
} from '@app/common-types';
import { FIRESTORE } from './firestore.provider';

@Injectable()
export class UnitFirestoreRepository implements IUnitRepository {
  private readonly logger = new Logger(UnitFirestoreRepository.name);
  private readonly collection: string = 'units';

  constructor(@Inject(FIRESTORE) private firestore: Firestore) {}

  async create(unit: CreateUnitDto): Promise<UnitDto> {
    try {
      const docRef = this.firestore.collection(this.collection).doc();
      const newUnit: UnitDto = { ...unit, id: docRef.id };

      await docRef.set(newUnit);
      this.logger.log(`Unit created with ID: ${docRef.id}`);
      return newUnit;
    } catch (error) {
      this.logger.error(`Error creating unit: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<UnitDto | null> {
    try {
      const doc = await this.firestore.collection(this.collection).doc(id).get();
      if (!doc.exists) {
        this.logger.warn(`Unit with ID ${id} not found.`);
        return null;
      }
      return doc.data() as UnitDto;
    } catch (error) {
      this.logger.error(`Error finding unit by ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<UnitDto[]> {
    try {
      const snapshot = await this.firestore.collection(this.collection).get();
      return this.excludeMaintenanceUnits(snapshot.docs.map((doc) => doc.data() as UnitDto));
    } catch (error) {
      this.logger.error(`Error finding all units: ${error.message}`);
      throw error;
    }
  }

  async findByPropertyId(propertyId: string): Promise<UnitDto[]> {
    try {
      const snapshot = await this.firestore
        .collection(this.collection)
        .where('propertyId', '==', propertyId)
        .get();
      const units = snapshot.docs.map((doc) => doc.data() as UnitDto);
      this.logger.log(`Found ${units.length} units for property ${propertyId}.`);
      return this.excludeMaintenanceUnits(units);
    } catch (error) {
      this.logger.error(
        `Error finding units for property ${propertyId}: ${error.message}`,
      );
      throw error;
    }
  }

  async update(id: string, unit: Partial<UnitDto>): Promise<UnitDto> {
    try {
      const docRef = this.firestore.collection(this.collection).doc(id);
      await docRef.update(unit);
      this.logger.log(`Unit with ID ${id} updated.`);
      const updatedDoc = await docRef.get();
      return updatedDoc.data() as UnitDto;
    } catch (error) {
      this.logger.error(`Error updating unit with ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.firestore.collection(this.collection).doc(id).delete();
      this.logger.log(`Unit with ID ${id} hard deleted.`);
    } catch (error) {
      this.logger.error(`Error hard deleting unit with ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async logicalDelete(id: string): Promise<void> {
    try {
      const docRef = this.firestore.collection(this.collection).doc(id);
      await docRef.update({ status: UnitStatus.UNDER_MAINTENANCE });
      this.logger.log(`Unit with ID ${id} logically deleted (status set to UNDER_MAINTENANCE).`);
    } catch (error) {
      this.logger.error(`Error logically deleting unit with ID ${id}: ${error.message}`);
      throw error;
    }
  }

  private excludeMaintenanceUnits(units: UnitDto[]): UnitDto[] {
    return units.filter((unit) => unit.status !== UnitStatus.UNDER_MAINTENANCE);
  }
}
