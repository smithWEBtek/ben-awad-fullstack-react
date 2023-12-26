import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import {createClient} from "redis"
import session from "express-session"
import { __prod__ } from "./constants";
// import { MyContext } from "./types";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  const app = express();

  const RedisStore = require("connect-redis").default
  const redisClient = createClient()
  redisClient.connect().catch(console.error)

  // Initialize Redis sesssion storage.
    app.use(
      session({
        name: "qid",
        store: new RedisStore({
          client: redisClient,
          disableTouch: true,
        }),
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
          httpOnly: true,
          sameSite: "lax", // csrf
          secure: __prod__ // cookie only works in https
        },
        secret: "asf4g7g6g22thy6jd3qfw3r5g5egat",
        resave: false, // required: force lightweight session keep alive (touch)
        saveUninitialized: false, // recommended: only save session when data exists
      })
    )
  
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    // context: ({req, res}): MyContext => ({ em: orm.em, req, res })
    context: ({req, res}) => ({ em: orm.em, req, res })
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.get('/', (_, res) => {
    res.send("hello there Frank");
  })

  app.listen(4000, () => {
    console.log('***  server started on localhost:4000  ***');
  })
};

main().catch((err) => {
  console.error(err);
});
