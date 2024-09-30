import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CustomUploadPipe } from "./pipes/custom.upload.pipe";
import { IntegrationManager } from "./integrations/integration.manager";

@Module({
  controllers: [],
    providers: [CustomUploadPipe, IntegrationManager],
    exports: [CustomUploadPipe, IntegrationManager],
    imports: [ConfigModule.forRoot()],
})
export class LibrariesNestModule {}
