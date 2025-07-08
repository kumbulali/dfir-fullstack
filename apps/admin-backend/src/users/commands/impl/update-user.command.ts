import { UpdateUserDto } from "src/users/dtos/update-user.dto";

export class UpdateUserCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: number,
    public readonly updateUserDto: UpdateUserDto,
  ) {}
}
