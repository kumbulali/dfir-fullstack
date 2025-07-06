import { Column, Entity, ManyToOne } from "typeorm";
import { AbstractEntity } from "../database/abstract.entity";
import { JobStatus } from "../enums";
import { Responder } from "./responder.entity";

@Entity({ name: "jobs" })
export class Job extends AbstractEntity<Job> {
  @Column()
  command: string;

  @Column({ type: "jsonb", nullable: true })
  args: any[];

  @Column({ type: "enum", enum: JobStatus, default: JobStatus.PENDING })
  status: JobStatus;

  @Column({ name: "result_data", type: "jsonb", nullable: true })
  resultData: Record<string, any>;

  @ManyToOne(() => Responder, { eager: true })
  responder: Responder;
}
