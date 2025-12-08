import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeFace, compareFaces, getCoachResponse } from '../geminiService';
import type { AnalysisResult, MogResult } from '../../types';

// Mock the GoogleGenAI module
vi.mock('@google/genai', () => {
  const mockChat = {
    sendMessage: vi.fn(),
  };

  const mockChats = {
    create: vi.fn(() => mockChat),
  };

  const mockModels = {
    generateContent: vi.fn(),
  };

  return {
    GoogleGenAI: vi.fn(function() {
      return {
        models: mockModels,
        chats: mockChats,
      };
    }),
    Type: {
      OBJECT: 'OBJECT',
      ARRAY: 'ARRAY',
      STRING: 'STRING',
      NUMBER: 'NUMBER',
      INTEGER: 'INTEGER',
    },
    Schema: {},
  };
});

// Import the mocked module to access mock functions
import { GoogleGenAI } from '@google/genai';

describe('geminiService', () => {
  let mockAi: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Get the mocked AI instance
    mockAi = new GoogleGenAI({ apiKey: 'test-key' });
  });

  describe('analyzeFace', () => {
    const mockBase64Image = 'base64ImageString';

    it('should successfully analyze a face and return analysis result', async () => {
      const mockAnalysisResult: AnalysisResult = {
        scores: {
          overall: 75,
          potential: 85,
          masculinity: 80,
          jawline: 70,
          skinQuality: 75,
          cheekbones: 72,
          eyeArea: 78,
        },
        tier: 'High Tier Normie',
        feedback: [
          'Strong jawline definition',
          'Good facial symmetry',
          'Skin quality could be improved',
        ],
        improvements: [
          { area: 'Skin', advice: 'Use retinol and sunscreen', priority: 'High' },
          { area: 'Jawline', advice: 'Mewing exercises', priority: 'Medium' },
        ],
      };

      mockAi.models.generateContent.mockResolvedValue({
        text: JSON.stringify(mockAnalysisResult),
      });

      const result = await analyzeFace(mockBase64Image);

      expect(result).toEqual(mockAnalysisResult);
      expect(mockAi.models.generateContent).toHaveBeenCalledWith({
        model: 'gemini-2.5-flash',
        contents: expect.objectContaining({
          parts: expect.arrayContaining([
            expect.objectContaining({
              inlineData: {
                mimeType: 'image/jpeg',
                data: mockBase64Image,
              },
            }),
            expect.objectContaining({
              text: expect.stringContaining('FaceiQ'),
            }),
          ]),
        }),
        config: expect.objectContaining({
          responseMimeType: 'application/json',
        }),
      });
    });

    it('should return error result when API call fails', async () => {
      mockAi.models.generateContent.mockRejectedValue(new Error('API Error'));

      const result = await analyzeFace(mockBase64Image);

      expect(result.tier).toBe('Error');
      expect(result.scores.overall).toBe(0);
      expect(result.feedback[0]).toContain('Could not analyze image');
    });

    it('should return error result when response has no text', async () => {
      mockAi.models.generateContent.mockResolvedValue({ text: null });

      const result = await analyzeFace(mockBase64Image);

      expect(result.tier).toBe('Error');
      expect(result.scores.overall).toBe(0);
    });

    it('should handle malformed JSON response gracefully', async () => {
      mockAi.models.generateContent.mockResolvedValue({
        text: 'invalid json',
      });

      const result = await analyzeFace(mockBase64Image);

      expect(result.tier).toBe('Error');
    });

    it('should correctly assign tier based on overall score', async () => {
      const testCases = [
        { overall: 45, expectedTier: 'Sub 5' },
        { overall: 55, expectedTier: 'Low Tier Normie' },
        { overall: 65, expectedTier: 'Mid Tier Normie' },
        { overall: 75, expectedTier: 'High Tier Normie' },
        { overall: 85, expectedTier: 'Chad Lite' },
        { overall: 92, expectedTier: 'Chad' },
        { overall: 97, expectedTier: 'True Adam' },
      ];

      for (const testCase of testCases) {
        const mockResult: AnalysisResult = {
          scores: {
            overall: testCase.overall,
            potential: testCase.overall + 10,
            masculinity: 80,
            jawline: 70,
            skinQuality: 75,
            cheekbones: 72,
            eyeArea: 78,
          },
          tier: testCase.expectedTier,
          feedback: ['Test feedback'],
          improvements: [],
        };

        mockAi.models.generateContent.mockResolvedValue({
          text: JSON.stringify(mockResult),
        });

        const result = await analyzeFace(mockBase64Image);
        expect(result.tier).toBe(testCase.expectedTier);
      }
    });
  });

  describe('compareFaces', () => {
    const mockImg1 = 'base64Image1';
    const mockImg2 = 'base64Image2';

    it('should successfully compare two faces', async () => {
      const mockMogResult: MogResult = {
        winnerIndex: 0,
        winnerTitle: 'LEFT MOGS',
        diffScore: 15,
        reason: 'Superior Jawline Definition',
        roast: "Right side's jawline couldn't cut butter.",
      };

      mockAi.models.generateContent.mockResolvedValue({
        text: JSON.stringify(mockMogResult),
      });

      const result = await compareFaces(mockImg1, mockImg2);

      expect(result).toEqual(mockMogResult);
      expect(mockAi.models.generateContent).toHaveBeenCalledWith({
        model: 'gemini-2.5-flash',
        contents: expect.objectContaining({
          parts: expect.arrayContaining([
            expect.objectContaining({
              inlineData: { mimeType: 'image/jpeg', data: mockImg1 },
            }),
            expect.objectContaining({
              inlineData: { mimeType: 'image/jpeg', data: mockImg2 },
            }),
          ]),
        }),
        config: expect.objectContaining({
          responseMimeType: 'application/json',
        }),
      });
    });

    it('should return error result when comparison fails', async () => {
      mockAi.models.generateContent.mockRejectedValue(new Error('Comparison failed'));

      const result = await compareFaces(mockImg1, mockImg2);

      expect(result.winnerTitle).toBe('ERROR');
      expect(result.diffScore).toBe(0);
      expect(result.reason).toContain('Could not compare');
    });

    it('should handle winner index 1 (second image wins)', async () => {
      const mockMogResult: MogResult = {
        winnerIndex: 1,
        winnerTitle: 'RIGHT DOMINATES',
        diffScore: 20,
        reason: 'Better eye area',
        roast: 'Left needs serious work.',
      };

      mockAi.models.generateContent.mockResolvedValue({
        text: JSON.stringify(mockMogResult),
      });

      const result = await compareFaces(mockImg1, mockImg2);

      expect(result.winnerIndex).toBe(1);
      expect(result.winnerTitle).toBe('RIGHT DOMINATES');
    });

    it('should return error result when response has no text', async () => {
      mockAi.models.generateContent.mockResolvedValue({ text: null });

      const result = await compareFaces(mockImg1, mockImg2);

      expect(result.winnerTitle).toBe('ERROR');
    });
  });

  describe('getCoachResponse', () => {
    const mockMessage = 'How can I improve my jawline?';
    const mockHistory = [
      { role: 'user', parts: [{ text: 'Hello' }] },
      { role: 'model', parts: [{ text: 'Hi there!' }] },
    ];

    it('should get a response from the coach', async () => {
      const mockResponse = 'Mew consistently and chew mastic gum daily.';
      const mockChat = {
        sendMessage: vi.fn().mockResolvedValue({ text: mockResponse }),
      };

      mockAi.chats.create.mockReturnValue(mockChat);

      const result = await getCoachResponse(mockMessage, mockHistory);

      expect(result).toBe(mockResponse);
      expect(mockAi.chats.create).toHaveBeenCalledWith({
        model: 'gemini-2.5-flash',
        config: expect.objectContaining({
          systemInstruction: expect.stringContaining('aesthetics coach'),
        }),
        history: mockHistory,
      });
      expect(mockChat.sendMessage).toHaveBeenCalledWith({ message: mockMessage });
    });

    it('should handle empty history', async () => {
      const mockResponse = 'Start with basic grooming.';
      const mockChat = {
        sendMessage: vi.fn().mockResolvedValue({ text: mockResponse }),
      };

      mockAi.chats.create.mockReturnValue(mockChat);

      const result = await getCoachResponse(mockMessage, []);

      expect(result).toBe(mockResponse);
      expect(mockAi.chats.create).toHaveBeenCalledWith(
        expect.objectContaining({
          history: [],
        })
      );
    });

    it('should pass system instruction for short responses', async () => {
      const mockChat = {
        sendMessage: vi.fn().mockResolvedValue({ text: 'Quick tip.' }),
      };

      mockAi.chats.create.mockReturnValue(mockChat);

      await getCoachResponse(mockMessage, mockHistory);

      expect(mockAi.chats.create).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            systemInstruction: expect.stringContaining('1–3 sentences MAX'),
          }),
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      const mockChat = {
        sendMessage: vi.fn().mockRejectedValue(new Error('API Error')),
      };

      mockAi.chats.create.mockReturnValue(mockChat);

      await expect(getCoachResponse(mockMessage, mockHistory)).rejects.toThrow('API Error');
    });

    it('should maintain conversation history context', async () => {
      const longHistory = [
        { role: 'user', parts: [{ text: 'Tell me about mewing' }] },
        { role: 'model', parts: [{ text: 'Mewing is tongue posture.' }] },
        { role: 'user', parts: [{ text: 'How long does it take?' }] },
        { role: 'model', parts: [{ text: 'Months to years.' }] },
      ];

      const mockChat = {
        sendMessage: vi.fn().mockResolvedValue({ text: 'Stay consistent.' }),
      };

      mockAi.chats.create.mockReturnValue(mockChat);

      await getCoachResponse('Any more tips?', longHistory);

      expect(mockAi.chats.create).toHaveBeenCalledWith(
        expect.objectContaining({
          history: longHistory,
        })
      );
    });
  });
});
