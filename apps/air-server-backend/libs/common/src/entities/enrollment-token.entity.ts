import { Column, Entity, Index } from "typeorm";
import { AbstractEntity } from "../database/abstract.entity";

@Entity({ name: "enrollment_tokens" })
export class EnrollmentToken extends AbstractEntity<EnrollmentToken> {
  @Column({ type: "varchar", length: 255 })
  token: string;

  @Column({ name: "tenant_id", type: "varchar", length: 255 })
  tenantId: string;

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt: Date;

  @Column({ name: "used_at", type: "timestamptz", nullable: true })
  usedAt: Date | null;
}
