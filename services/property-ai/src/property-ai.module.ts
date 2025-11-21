import { Module } from '@nestjs/common';
import { PropertyAiController } from './property-ai.controller';
import { PropertyAiService } from './property-ai.service';
import { firestoreProvider } from './firestore.provider';
import { PropertyFirestoreRepository } from './property.firestore.repository';
import { I_PROPERTY_REPOSITORY, IPropertyRepository } from '@app/common-types'; 
import { UnitAiService } from './unit-ai.service';
import { UnitAiController } from './unit-ai.controller';
import { UnitFirestoreRepository } from './unit.firestore.repository';
import { I_UNIT_REPOSITORY } from '@app/common-types';
import { AgentModule } from './agent/agent.module';

@Module({
  imports: [AgentModule],
  controllers: [PropertyAiController, UnitAiController],
  providers: [PropertyAiService, firestoreProvider,

  {                                                                                                                                       
      provide: I_PROPERTY_REPOSITORY, // When something asks for IPropertyRepository                                                              
      useClass: PropertyFirestoreRepository, // Provide PropertyFirestoreRepository}
  },
  
  UnitAiService,
 {
      provide: I_UNIT_REPOSITORY,
      useClass: UnitFirestoreRepository,
},
     ],
})
export class PropertyAiModule {}