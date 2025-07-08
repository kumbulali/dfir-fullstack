import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  ValidationPipe,
  ClassSerializerInterceptor,
  UseInterceptors,
  Headers,
  Query,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateUserCommand } from "./commands/impl/create-user.command";
import { GetUsersQuery } from "./queries/impl/get-users.query";
import { GetUserQuery } from "./queries/impl/get-user.query";
import { UpdateUserCommand } from "./commands/impl/update-user.command";
import { DeleteUserCommand } from "./commands/impl/delete-user.command";
import { AdminJwtGuard } from "src/guards/admin-jwt.guard";
import { PaginationDto } from "@app/common";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";

@UseGuards(AdminJwtGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller("tenants/:tenantId/users")
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  createUser(
    @Param("tenantId") tenantId: string,
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ) {
    return this.commandBus.execute(
      new CreateUserCommand(tenantId, createUserDto),
    );
  }

  @Get()
  getUsers(
    @Param("tenantId") tenantId: string,
    @Query(new ValidationPipe({ transform: true }))
    paginationDto: PaginationDto,
  ) {
    return this.queryBus.execute(new GetUsersQuery(tenantId, paginationDto));
  }

  @Get(":userId")
  getUser(
    @Param("tenantId") tenantId: string,
    @Param("userId", ParseIntPipe) userId: number,
  ) {
    return this.queryBus.execute(new GetUserQuery(tenantId, userId));
  }

  @Patch(":userId")
  updateUser(
    @Param("tenantId") tenantId: string,
    @Param("userId", ParseIntPipe) userId: number,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.commandBus.execute(
      new UpdateUserCommand(tenantId, userId, updateUserDto),
    );
  }

  @Delete(":userId")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(
    @Param("tenantId") tenantId: string,
    @Param("userId", ParseIntPipe) userId: number,
  ) {
    return this.commandBus.execute(new DeleteUserCommand(tenantId, userId));
  }
}
