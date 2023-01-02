const { ApolloServer, gql } = require('apollo-server');
const axios = require('axios');
const { RESTDataSource } = require('apollo-datasource-rest');

// REST APIからのデータ取得用
class jsonPlaceAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://jsonplaceholder.typicode.com/';
  }

  async getUsers() {
    const data = await this.get('/users');
    return data;
  }
  async getUser(id) {
    const data = await this.get(`/users/${id}`);
    return data;
  }
  async getPosts() {
    const data = await this.get('/posts');
    return data;
  }
}

// 仮データ
const users = [
    { id: '1', name: 'John Doe', email: 'john@test.com' },
    { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
  ];

// schema定義
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    myPosts: [Post]
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    userId: ID!
  }

  type Query {
    hello(name: String!): String
    users: [User]
    user(id: ID!): User
    posts: [Post]
  }
`;

// resolvers設定
const resolvers = {
  Query: {
    hello: (parent, args) => `Hello ${args.name}`,
    users: async (parent, args, { dataSources }) => {
    },
    user: async (parent, args, { dataSources }) => {
      return dataSources.jsonPlaceAPI.getUser(args.id);
    },
    posts: async (parent, args, { dataSources }) => {
    },
  },
  User: {
    myPosts: async (parent, args, { dataSources }) => {
      const posts = await dataSources.jsonPlaceAPI.getPosts();
      const myPosts = posts.filter((post) => post.userId == parent.id);
      return myPosts;
    },
  },
}

// Apollo Server立ち上げ
const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => {
    return {
      jsonPlaceAPI: new jsonPlaceAPI(),
    };
  },
});

server.listen().then(({ url }) => {
console.log(`🚀  Server ready at ${url}`);
});