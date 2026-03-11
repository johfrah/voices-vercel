import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSingle = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

describe('AssetManager.getMediaMetadata', () => {
  beforeEach(() => {
    vi.resetModules();
    mockSingle.mockReset();
    mockEq.mockReset();
    mockSelect.mockReset();
    mockFrom.mockReset();

    const chain = {
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    };

    mockFrom.mockReturnValue(chain);
    mockSelect.mockReturnValue(chain);
    mockEq.mockReturnValue(chain);
  });

  it('only resolves metadata for public media rows', async () => {
    mockSingle.mockResolvedValue({
      data: { file_path: 'agency/demo.mp3', file_type: 'audio/mpeg' },
      error: null,
    });

    const { AssetManager } = await import('./asset-manager');
    const result = await AssetManager.getMediaMetadata(42);

    expect(mockFrom).toHaveBeenCalledWith('media');
    expect(mockSelect).toHaveBeenCalledWith('file_path, file_type');
    expect(mockEq).toHaveBeenNthCalledWith(1, 'id', 42);
    expect(mockEq).toHaveBeenNthCalledWith(2, 'is_public', true);
    expect(result).toEqual({
      filePath: 'agency/demo.mp3',
      fileType: 'audio/mpeg',
    });
  });

  it('returns null when no public media row is available', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'No rows' },
    });

    const { AssetManager } = await import('./asset-manager');
    const result = await AssetManager.getMediaMetadata(404);

    expect(result).toBeNull();
  });
});
