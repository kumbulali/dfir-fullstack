import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import * as bcrypt from "bcrypt";
import { CreateUserCommand } from "../impl/create-user.command";
import { ConflictException } from "@nestjs/common";
import { TenantConnectionManager, User } from "@app/common";

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly tenantManager: TenantConnectionManager) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const { tenantId, createUserDto } = command;
    const { email, password } = createUserDto;

    const connection = await this.tenantManager.getConnection(tenantId);
    const userRepository = connection.getRepository(User);

    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException(
        `User with email '${email}' already exists in this tenant.`,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = userRepository.create({ email, password: hashedPassword });

    return userRepository.save(newUser);
  }
}
