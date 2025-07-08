import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateUserCommand } from "../impl/update-user.command";
import { TenantConnectionManager, User } from "@app/common";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { Not } from "typeorm";
import * as bcrypt from "bcrypt";

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(private readonly tenantManager: TenantConnectionManager) {}

  async execute(command: UpdateUserCommand): Promise<User> {
    const { tenantId, userId, updateUserDto } = command;
    const connection = await this.tenantManager.getConnection(tenantId);
    const userRepository = connection.getRepository(User);

    const userToUpdate = await userRepository.findOneBy({ id: userId });
    if (!userToUpdate) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    if (updateUserDto.email && updateUserDto.email !== userToUpdate.email) {
      const existingUser = await userRepository.findOneBy({
        email: updateUserDto.email,
        id: Not(userId),
      });
      if (existingUser) {
        throw new ConflictException(
          `Email '${updateUserDto.email}' is already in use.`,
        );
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(userToUpdate, updateUserDto);
    return userRepository.save(userToUpdate);
  }
}
