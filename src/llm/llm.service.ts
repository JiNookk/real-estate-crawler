import { Injectable, Inject } from '@nestjs/common';
import type { ILlmClient, SelectorResult } from './llm.interface';
import { LLM_CLIENT } from './llm.interface';

@Injectable()
export class LlmService implements ILlmClient {
  private strategy: ILlmClient;

  constructor(@Inject(LLM_CLIENT) strategy: ILlmClient) {
    this.strategy = strategy;
  }

  setStrategy(strategy: ILlmClient): void {
    this.strategy = strategy;
  }

  async generateSelectors(
    html: string,
    targetFields: string[],
  ): Promise<SelectorResult> {
    return this.strategy.generateSelectors(html, targetFields);
  }
}
