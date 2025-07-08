import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteUserCommand } from "../impl/delete-user.command";
import { TenantConnectionManager, User } from "@app/common";
import { NotFoundException } from "@nestjs/common";

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly tenantManager: TenantConnectionManager) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const { tenantId, userId } = command;
    const connection = await this.tenantManager.getConnection(tenantId);
    const userRepository = connection.getRepository(User);

    const deleteResult = await userRepository.delete(userId);

    if (deleteResult.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
  }
}
