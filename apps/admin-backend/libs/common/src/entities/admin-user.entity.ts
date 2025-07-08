import { Column, Entity } from "typeorm";
import { AbstractEntity } from "../database/abstract.entity";
import { Exclude } from "class-transformer";

@Entity({ name: "admin_users" })
export class AdminUser extends AbstractEntity<AdminUser> {
  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;
}
