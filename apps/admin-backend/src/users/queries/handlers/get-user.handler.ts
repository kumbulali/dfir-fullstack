import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUserQuery } from "../impl/get-user.query";
import { TenantConnectionManager, User } from "@app/common";
import { NotFoundException } from "@nestjs/common";

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly tenantManager: TenantConnectionManager) {}

  async execute(query: GetUserQuery): Promise<User> {
    const { tenantId, userId } = query;
    const connection = await this.tenantManager.getConnection(tenantId);
    const userRepository = connection.getRepository(User);

    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(
        `User with ID ${userId} not found in this tenant.`,
      );
    }
    return user;
  }
}
