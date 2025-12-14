import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { LlmService } from './llm.service';
import { ClaudeStrategy } from './strategies/claude.strategy';
import { LLM_CLIENT } from './llm.interface';

@Module({
  providers: [
    {
      provide: LLM_CLIENT,
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('CLAUDE_API_KEY');
        const client = new Anthropic({ apiKey });
        return new ClaudeStrategy(client);
      },
      inject: [ConfigService],
    },
    LlmService,
  ],
  exports: [LlmService],
})
export class LlmModule {}
