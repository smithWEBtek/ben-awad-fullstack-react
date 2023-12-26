import { Resolver, Query, Ctx, Arg, Mutation, InputType, Field, ObjectType } from 'type-graphql';
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

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [{
          field: "username",
          message: "must be greater than 2"
        }]
      }
    }

    if (options.password.length <= 3) {
      return {
        errors: [{
          field: "password",
          message: "must be greater than 3"
        }]
      }
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, { username: options.username, password: hashedPassword })
    try {
      await em.persistAndFlush(user);
    } catch (err) {
      return {
        errors: [{
          field: "username",
          message: "username is taken"
        }]
      }
    }
    return { user };
  }

  // login a user
  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username })
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "that username does not exist"
          }
        ]
      }
    };

    const valid = await argon2.verify(user.password, options.password)
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password"
          }
        ]
      }
    }

    // req.session["userId"] = user.id;
    // req.session["userId"] = user.id;
    
  req.session["userId"] = user.id

  // console.log('====* * * req: ', req);
  // console.log('====* * * req keys: ', Object.keys(req));
  // =* * * req keys:  [
    //   '_readableState',   '_events',
    //   '_eventsCount',     '_maxListeners',
    //   'socket',           'httpVersionMajor',
    //   'httpVersionMinor', 'httpVersion',
    //   'complete',         'rawHeaders',
    //   'rawTrailers',      'aborted',
    //   'upgrade',          'url',
    //   'method',           'statusCode',
    //   'statusMessage',    'client',
    //   '_consuming',       '_dumped',
    //   'next',             'baseUrl',
    //   'originalUrl',      '_parsedUrl',
    //   'params',           'query',
    //   'res',              '_parsedOriginalUrl',
    //   'sessionStore',     'sessionID',
    //   'session',          'body',
    //   '_body',            'length'
    // ]
    console.log('====* * * req.session: ', req.session);
    return { user };
  }

  // get one user
  @Query(() => User, { nullable: true })
  user(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<User | null> {
    return em.findOne(User, { id });
  }

  // get all users
  @Query(() => [User])
  users(@Ctx() { em }: MyContext): Promise<User[]> {
    return em.find(User, {});
  }

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

  // delete user
  @Mutation(() => Boolean)
  async deleteUser(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<Boolean> {
    await em.nativeDelete(User, { id })
    return true;
  }
}
