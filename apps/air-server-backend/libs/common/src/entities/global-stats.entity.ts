import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "global_stats" })
export class GlobalStats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "total_tenants", type: "int", default: 0 })
  totalTenants: number;

  @Column({ name: "total_responders", type: "int", default: 0 })
  totalResponders: number;

  @Column({ name: "healthy_responders", type: "int", default: 0 })
  healthyResponders: number;

  @Column({ name: "total_jobs", type: "int", default: 0 })
  totalJobs: number;

  @Column({ name: "pending_jobs", type: "int", default: 0 })
  pendingJobs: number;

  @Column({ name: "completed_jobs", type: "int", default: 0 })
  completedJobs: number;

  @Column({ name: "failed_jobs", type: "int", default: 0 })
  failedJobs: number;

  @UpdateDateColumn({ name: "last_updated_at" })
  lastUpdatedAt: Date;
}
