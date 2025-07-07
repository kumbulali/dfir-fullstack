import { Column, Entity } from "typeorm";
import { AbstractEntity } from "../database/abstract.entity";

@Entity({ name: "users" })
export class User extends AbstractEntity<User> {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
