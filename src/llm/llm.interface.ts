export interface SelectorResult {
  selectors: Record<string, string>;
  confidence: number;
}

export interface ILlmClient {
  /**
   * HTML에서 타겟 필드에 대한 CSS 셀렉터를 생성합니다.
   * @param html 렌더링된 HTML
   * @param targetFields 추출할 필드명 (예: ['price', 'size', 'address'])
   * @returns 필드별 CSS 셀렉터와 신뢰도
   */
  generateSelectors(
    html: string,
    targetFields: string[],
  ): Promise<SelectorResult>;
}

export const LLM_CLIENT = Symbol('LLM_CLIENT');
