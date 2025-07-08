import { Column, Entity } from "typeorm";
import { AbstractEntity } from "../database/abstract.entity";
import { Exclude } from "class-transformer";

@Entity({ name: "users" })
export class User extends AbstractEntity<User> {
  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;
}
