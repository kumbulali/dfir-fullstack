import { CreateUserDto } from "src/users/dtos/create-user.dto";

export class CreateUserCommand {
  constructor(
    public readonly tenantId: string,
    public readonly createUserDto: CreateUserDto,
  ) {}
}
