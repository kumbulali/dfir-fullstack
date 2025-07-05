import { Column, Entity } from "typeorm";
import { AbstractEntity } from "../database/abstract.entity";

@Entity()
export class User extends AbstractEntity<User> {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
