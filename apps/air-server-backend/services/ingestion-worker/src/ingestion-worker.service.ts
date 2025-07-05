import { Injectable } from '@nestjs/common';

@Injectable()
export class IngestionWorkerService {
  getHello(): string {
    return 'Hello World!';
  }
}
