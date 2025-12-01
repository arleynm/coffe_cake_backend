import { MediaEntity } from "./media.entity";

export abstract class MediaRepository {
  abstract create(data: {
    filename: string;
    path: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<MediaEntity>;

  abstract findById(id: string): Promise<MediaEntity | null>;
}
