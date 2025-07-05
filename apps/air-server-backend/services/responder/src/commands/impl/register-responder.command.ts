import { RegisterResponderDto } from "../../dtos/register-responder.dto";

export class RegisterResponderCommand {
  constructor(
    public readonly tenantId: string,
    public readonly registerDto: RegisterResponderDto,
    public readonly ipAddress: string,
  ) {}
}
