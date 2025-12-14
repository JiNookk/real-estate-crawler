import { ClaudeStrategy } from './claude.strategy';

describe('ClaudeStrategy', () => {
  describe('generateSelectors', () => {
    it('HTML에서 타겟 필드에 대한 셀렉터를 생성한다', async () => {
      // Given
      const mockAnthropicClient = {
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  selectors: {
                    price: '.item-price',
                    address: '.item-address',
                  },
                  confidence: 0.9,
                }),
              },
            ],
          }),
        },
      };

      const strategy = new ClaudeStrategy(mockAnthropicClient as any);
      const html = '<div class="item"><span class="item-price">1억</span></div>';
      const targetFields = ['price', 'address'];

      // When
      const result = await strategy.generateSelectors(html, targetFields);

      // Then
      expect(result.selectors).toEqual({
        price: '.item-price',
        address: '.item-address',
      });
      expect(result.confidence).toBe(0.9);
    });

    it('모든 타겟 필드에 대한 셀렉터를 요청한다', async () => {
      // Given
      const mockAnthropicClient = {
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  selectors: { price: '.price' },
                  confidence: 0.8,
                }),
              },
            ],
          }),
        },
      };

      const strategy = new ClaudeStrategy(mockAnthropicClient as any);
      const html = '<div>test</div>';
      const targetFields = ['price', 'size', 'floor'];

      // When
      await strategy.generateSelectors(html, targetFields);

      // Then
      const callArgs = mockAnthropicClient.messages.create.mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain('price');
      expect(callArgs.messages[0].content).toContain('size');
      expect(callArgs.messages[0].content).toContain('floor');
    });

    it('LLM 응답이 유효하지 않으면 에러를 던진다', async () => {
      // Given
      const mockAnthropicClient = {
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [{ type: 'text', text: 'invalid json' }],
          }),
        },
      };

      const strategy = new ClaudeStrategy(mockAnthropicClient as any);

      // When & Then
      await expect(
        strategy.generateSelectors('<div></div>', ['price']),
      ).rejects.toThrow();
    });
  });
});
