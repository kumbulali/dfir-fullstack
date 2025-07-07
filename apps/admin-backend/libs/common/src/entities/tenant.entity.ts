import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { TenantStatus } from "../enums";

@Entity({ name: "tenants" })
export class Tenant {
  @PrimaryColumn({ type: "varchar", length: 255 })
  id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({
    type: "enum",
    enum: TenantStatus,
    default: TenantStatus.PENDING_SETUP,
  })
  status: TenantStatus;

  @Column({ name: "db_host", type: "varchar", length: 255 })
  dbHost: string;

  @Index({ unique: true })
  @Column({ name: "db_name", type: "varchar", length: 255 })
  dbName: string;

  @Column({ name: "db_user", type: "varchar", length: 255 })
  dbUser: string;

  @Column({ name: "db_password_ref", type: "varchar", length: 512 })
  dbPasswordRef: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
}
