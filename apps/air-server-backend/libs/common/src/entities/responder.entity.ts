import { Column, Entity } from "typeorm";
import { AbstractEntity } from "../database/abstract.entity";
import { ResponderStatus } from "../enums";

@Entity({ name: "responders" })
export class Responder extends AbstractEntity<Responder> {
  @Column({ type: "varchar", length: 255, unique: true, nullable: false })
  token: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  password: string;

  @Column({ name: "ip_address", type: "varchar", length: 45, nullable: true })
  ipAddress: string;

  @Column({
    name: "operating_system",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  operatingSystem: string;

  @Column({ name: "last_seen", type: "timestamptz", nullable: true })
  lastSeen: Date;

  @Column({
    type: "enum",
    enum: ResponderStatus,
    default: ResponderStatus.UNKNOWN,
  })
  status: ResponderStatus;

  @Column({ name: "active_jti", type: "varchar", length: 255, nullable: true })
  activeJti: string;
}
