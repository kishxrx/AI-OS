import { Module } from '@nestjs/common';
import { AgentModule } from './agent/agent.module';
import { PropertyAiController } from './property-ai.controller';
import { PropertyAiService } from './property-ai.service';
import { firestoreProvider } from './firestore.provider';
import { PropertyFirestoreRepository } from './property.firestore.repository';
import { UnitAiService } from './unit-ai.service';
import { UnitAiController } from './unit-ai.controller';
import { UnitFirestoreRepository } from './unit.firestore.repository';
import { I_PROPERTY_REPOSITORY, I_UNIT_REPOSITORY } from '@app/common-types';
import { PubSubClient } from '@app/pubsub-sdk';

@Module({
  imports: [AgentModule],
  controllers: [PropertyAiController, UnitAiController],
  providers: [
    PropertyAiService,
    PubSubClient,
    firestoreProvider,
    {
      provide: I_PROPERTY_REPOSITORY,
      useClass: PropertyFirestoreRepository,
    },
    UnitAiService,
    {
      provide: I_UNIT_REPOSITORY,
      useClass: UnitFirestoreRepository,
    },
  ],
})
export class PropertyAiModule {}
