import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [],
  providers: [],
  exports: [],
  imports: [ConfigModule.forRoot()]
})
export class LibrariesNestModule {}
