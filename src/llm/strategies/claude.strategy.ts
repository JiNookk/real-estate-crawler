import Anthropic from '@anthropic-ai/sdk';
import { ILlmClient, SelectorResult } from '../llm.interface';

export class ClaudeStrategy implements ILlmClient {
  constructor(private readonly client: Anthropic) {}

  async generateSelectors(
    html: string,
    targetFields: string[],
  ): Promise<SelectorResult> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: this.buildPrompt(html, targetFields),
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('LLM 응답에서 텍스트를 찾을 수 없습니다');
    }

    return this.parseResponse(textContent.text);
  }

  private buildPrompt(html: string, targetFields: string[]): string {
    return `아래 HTML에서 다음 필드들을 추출할 수 있는 CSS 셀렉터를 찾아주세요.

추출할 필드: ${targetFields.join(', ')}

HTML:
${html}

응답은 반드시 다음 JSON 형식으로만 반환해주세요 (다른 텍스트 없이):
{
  "selectors": {
    "필드명": "CSS셀렉터",
    ...
  },
  "confidence": 0.0~1.0 사이의 신뢰도
}`;
  }

  private parseResponse(text: string): SelectorResult {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('LLM 응답에서 JSON을 파싱할 수 없습니다');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.selectors || typeof parsed.confidence !== 'number') {
      throw new Error('LLM 응답 형식이 올바르지 않습니다');
    }

    return {
      selectors: parsed.selectors,
      confidence: parsed.confidence,
    };
  }
}
