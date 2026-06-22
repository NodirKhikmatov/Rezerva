import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private readonly client: SupabaseClient | null;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url');
    const key = this.configService.get<string>('supabase.serviceRoleKey');
    this.bucket =
      this.configService.get<string>('supabase.bucket') ?? 'uploads';

    this.client =
      url && key
        ? createClient(url, key, {
            auth: { persistSession: false, autoRefreshToken: false },
          })
        : null;
  }

  async uploadFile(path: string, file: Buffer, contentType: string) {
    if (!this.client) {
      throw new Error('Supabase Storage is not configured');
    }

    const { data, error } = await this.client.storage
      .from(this.bucket)
      .upload(path, file, { contentType, upsert: true });

    if (error) {
      throw error;
    }

    const { data: publicUrl } = this.client.storage
      .from(this.bucket)
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  }
}
