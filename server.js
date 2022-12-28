const express = require("express");
const { buildSchema } = require("graphql");
const { graphqlHTTP } = require("express-graphql");
const axios = require("axios");
const sql = require('mssql/msnodesqlv8');
const app = express();




/*
ID
String
Int
Float
Boolean
List -[]
*/

let message = "This is a message";

const schema = buildSchema(`

type Post {
    userID: Int
    id: Int
    title: String
    body: String
}

type User {
    name: String
    age: Int
    college: String
}

type Query {
    hello: String!
    welcomeMessage(name: String, dayOfWeek: String!): String
    getUser: User
    getUsers: [User] 
    getPostsFromExternalAPI: [Post]
    message: String
}

input UserInput {
  name: String!
  age: Int!
  college: String!
}

type Mutation {
setMessage(newMessage: String): String
createUser(user: UserInput): User
}

`);
// createUser(name: String, age: Int!, college: String!): User


const user = {
  name: "romi Mittal",
  age: 26,
  college: "IIt Guwahati",
};

const users = [
  {
    name: "Truly Mittal",
    age: 26,
    college: "IIt Guwahati",
  },
  {
    name: "Jhon Doe",
    age: 265,
    college: "Exemple",
  },
];

const root = {
  hello: () => {
    return "hello world!";
    // return null;
  },
  welcomeMessage: (args) => {
    console.log(args);
    return `Hey ${args.name}, hows life, today is ${args.dayOfWeek}`;
  },
  getUser: () => {
    return user;
  },
  getUsers: () => {
    return users;
  },
  getPostsFromExternalAPI: async () => {
    const res = axios
      .get("https://dummyjson.com/products/")
      .then((result) => result.data.products);
    return res;
  },
  setMessage: ({ newMessage }) => {
    message = newMessage;
    return message;
  },
  message: () => message,
  createUser: (args) => {
    console.log(args);
    return args.user;
  },
  getUser: ()=>{
    const config = {
      connectionString: 'Driver=SQL Server;Server=MENIR\\SQLEXPRESS;Database=graphQl;Trusted_Connection=true;'
    };
    sql.connect(config, err => {
      new sql.Request().query('SELECT * from newUser', (err, result) => {
        console.log(".:The Good Place:.");
        if(err) { // SQL error, but connection OK.
          console.log("  Shirtballs: "+ err);
        } else { // All is rosey in your garden.
          console.log(result);
          return result;
        };
      });
    });
    sql.on('error', err => { // Connection borked.
      console.log(".:The Bad Place:.");
      console.log("  Fork: "+ err);
    });
  }
};
app.use(
  "/graphql",
  graphqlHTTP({
    graphiql: true,
    schema: schema,
    rootValue: root,
  })
);

app.listen(4000, () => console.log("* server on port 4000"));
