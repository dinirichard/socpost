import { Module } from "@nestjs/common";

import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { IntegrationsModule } from "./integrations/integrations.module";
import { DatabaseModule } from "../database/database.module";
import { MediaModule } from "./upload/media.module";
import { LibrariesNestModule } from "@socpost/libraries/nest/lib/nest.module";
import { PostModule } from "./posts/post.module";

@Module({
    imports: [
        AuthModule,
        DatabaseModule,
        IntegrationsModule,
        UsersModule,
        MediaModule,
        LibrariesNestModule,
        PostModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
