import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CustomUploadPipe } from "./pipes/custom.upload.pipe";

@Module({
    controllers: [],
    providers: [CustomUploadPipe],
    exports: [CustomUploadPipe],
    imports: [ConfigModule.forRoot()],
})
export class LibrariesNestModule {}
