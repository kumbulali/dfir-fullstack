import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { CqrsModule } from "@nestjs/cqrs";
import { GetUsersHandler } from "./queries/handlers/get-users.handler";
import { GetUserHandler } from "./queries/handlers/get-user.handler";
import { CreateUserHandler } from "./commands/handlers/create-user.handler";
import { UpdateUserHandler } from "./commands/handlers/update-user.handler";
import { DeleteUserHandler } from "./commands/handlers/delete-user.handler";

export const CommandHandlers = [
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
];

export const QueryHandlers = [GetUsersHandler, GetUserHandler];

@Module({
  imports: [CqrsModule],
  controllers: [UsersController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class UsersModule {}
