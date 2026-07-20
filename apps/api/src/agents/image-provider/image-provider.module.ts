import { Global, Module } from '@nestjs/common';
import { ImageProviderService } from './image-provider.service';

@Global()
@Module({
  providers: [ImageProviderService],
  exports: [ImageProviderService],
})
export class ImageProviderModule {}
