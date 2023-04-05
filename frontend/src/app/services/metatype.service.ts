import { Injectable } from '@angular/core';
import { Metatype } from '../classes/metatype';

@Injectable({
  providedIn: 'root',
})
export class MetatypeService {
  metatypes: Array<Metatype> = [
    {
      type: 'basic-shapes',
      entityTypes: ['box', 'cylinder', 'sphere'],
      timeEntityNum: 1,
      freqEntityNum: 3,
    },
    {
      type: 'blob',
      entityTypes: ['box', 'cylinder', 'sphere'],
      timeEntityNum: 1,
      freqEntityNum: 3,
    }
  ];

  constructor() {}

  getTypes(): Array<string> {
    return this.metatypes.map((metatype) => metatype.type);
  }

  getEntityTypes(type: string): string[] | undefined {
    return this.metatypes.find((metatype) => metatype.type === type)
      ?.entityTypes;
  }

  getMetatype(type: string): Metatype | undefined {
    return this.metatypes.find((metatype) => metatype.type === type);
  }

  addMetatype(
    type: string,
    entityTypes: string[],
    timeEntityNum: number = 1,
    freqEntityNum: number = 1
  ): void {
    this.metatypes.push({
      type,
      entityTypes,
      timeEntityNum: Math.min(timeEntityNum, entityTypes.length),
      freqEntityNum: Math.min(freqEntityNum, entityTypes.length),
    });
  }
}
