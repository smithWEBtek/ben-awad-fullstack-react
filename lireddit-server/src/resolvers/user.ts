import { Resolver, Query, Ctx, Arg, Mutation, InputType, Field } from 'type-graphql';
import { User } from "../entities/User";
import { MyContext } from 'src/types';
import argon2 from 'argon2';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string
  @Field()
  password: string
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ) {
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, { username: options.username, password: hashedPassword })
    await em.persistAndFlush(user);
  }

  @Query(() => User, { nullable: true })
  user(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<User | null> {
    return em.findOne(User, { id });
  }

  @Query(() => [User])
  users(@Ctx() { em }: MyContext): Promise<User[]> {
    return em.find(User, {});
  }

  // @Mutation(() => User)
  // async createUser(
  //   @Arg("username") username: string,
  //   @Arg("password") password: string,
  //   @Ctx() { em }: MyContext
  // ): Promise<User> {
  //   const user = em.create(User, { username, password })
  //   await em.persistAndFlush(user)
  //   return user;
  // }

  // @Mutation(() => User, { nullable: true })
  // async updateUser(
  //   @Arg("id") id: number,
  //   @Arg("title") title: string,
  //   @Ctx() { em }: MyContext
  // ): Promise<User | null> {
  //   const user = await em.findOne(User, { id })
  //   if (!user) {
  //     return null;
  //   }
  //   if (typeof title !== "undefined") {
  //     user.title = title
  //     await em.persistAndFlush(user)
  //   }
  //   return user;
  // }

  // @Mutation(() => Boolean)
  // async deleteUser(
  //   @Arg("id") id: number,
  //   @Ctx() { em }: MyContext
  // ): Promise<Boolean> {
  //   await em.nativeDelete(User, { id })
  //   return true;
  // }
}
