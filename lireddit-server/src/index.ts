import { MikroORM } from "@mikro-orm/core";
import microConfig from "./mikro-orm.config";
// import { Post } from "./entities/Post";
import express from "express";
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  const app = express();
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver],
      validate: false
    })
  });

  // const post = orm.em.create(Post, { title: "my first post" });
  // await orm.em.persistAndFlush(post);
  // const posts = await orm.em.find(Post, {});

  // app.get('/posts', (_, res) => {
  //   res.send(posts.map((post) => post.title))
  // })

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



