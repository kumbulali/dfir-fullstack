import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateTenantCommand } from "../impl/update-tenant.command";
import { MASTER_DB_CONNECTION, Tenant } from "@app/common";
import { Inject, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";

@CommandHandler(UpdateTenantCommand)
export class UpdateTenantHandler
  implements ICommandHandler<UpdateTenantCommand>
{
  constructor(
    @Inject(MASTER_DB_CONNECTION) private readonly masterConnection: DataSource,
  ) {}

  async execute(command: UpdateTenantCommand): Promise<Tenant> {
    const { tenantId, updateTenantDto } = command;
    const tenantRepository = this.masterConnection.getRepository(Tenant);

    const tenant = await tenantRepository.findOneBy({ id: tenantId });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID '${tenantId}' not found.`);
    }

    Object.assign(tenant, updateTenantDto);
    return tenantRepository.save(tenant);
  }
}
