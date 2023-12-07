import { Resolver, Query } from 'type-graphql';

@Resolver()
export class HelloResolver {
  // mutation or query functions
  @Query(() => String)
  hello() {
    return "hello resolved world"
  }

  @Query(() => String)
  goodbye() {
    return "buh bye"
  }
}
