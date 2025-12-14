import { LlmService } from './llm.service';
import { ILlmClient, SelectorResult } from './llm.interface';

describe('LlmService', () => {
  describe('generateSelectors', () => {
    it('주입된 전략을 사용하여 셀렉터를 생성한다', async () => {
      // Given
      const mockResult: SelectorResult = {
        selectors: { price: '.price' },
        confidence: 0.9,
      };

      const mockStrategy: ILlmClient = {
        generateSelectors: jest.fn().mockResolvedValue(mockResult),
      };

      const service = new LlmService(mockStrategy);

      // When
      const result = await service.generateSelectors('<div></div>', ['price']);

      // Then
      expect(result).toEqual(mockResult);
      expect(mockStrategy.generateSelectors).toHaveBeenCalledWith(
        '<div></div>',
        ['price'],
      );
    });

    it('런타임에 전략을 교체할 수 있다', async () => {
      // Given
      const strategy1: ILlmClient = {
        generateSelectors: jest
          .fn()
          .mockResolvedValue({ selectors: {}, confidence: 0.5 }),
      };
      const strategy2: ILlmClient = {
        generateSelectors: jest
          .fn()
          .mockResolvedValue({ selectors: {}, confidence: 0.9 }),
      };

      const service = new LlmService(strategy1);

      // When
      service.setStrategy(strategy2);
      await service.generateSelectors('<div></div>', ['price']);

      // Then
      expect(strategy1.generateSelectors).not.toHaveBeenCalled();
      expect(strategy2.generateSelectors).toHaveBeenCalled();
    });
  });
});
