import { Chunk, ChunkType } from '../rendering/parsed_types';

export function countType(chunks: Chunk[], type: ChunkType): number {
  return chunks.filter((chunk) => chunk.type === type).length;
}
