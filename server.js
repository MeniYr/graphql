const express = require("express");
const { buildSchema } = require("graphql");
const { graphqlHTTP } = require("express-graphql");
const axios = require("axios");
const sql = require("mssql/msnodesqlv8");
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
let data="";
const schema = buildSchema(`

type Post {
    userID: Int
    id: Int
    title: String
    body: String
}

type User {
    student_name: String
    age: Int
    college: String
}

type Query {
    hello: String!
    welcomeMessage(name: String, dayOfWeek: String!): String
    getUser: User
    getUsers: [User] 
    getPostsFromExternalAPI: [Post]
    getFromSq: [User]
    message: String
}

input NameToAsk{
  nameToAsk: String
}

input UserInput {
  name: String!
  age: Int!
  college: String!
}

input UserEditInput {
  nameToAsk: String!
  name: String!
  age: Int!
  college: String!
}


type Mutation {
setMessage(newMessage: String): String
createUser(user: UserInput): User
editUser(user: UserEditInput): [User]
createRowSq (user: UserInput): [User]
deleteRowSq (user: NameToAsk): [User]
}

`);
// createUser(name: String, age: Int!, college: String!): User

const config = {
  connectionString:
    "Driver=SQL Server;Server=MENIR\\SQLEXPRESS;Database=graphQL;Trusted_Connection=true;",
};
const SQLconnection = ()=>{
  sql.connect(config, (err) => {
  new sql.Request().query("SELECT * from users ", (err, result) => {
    console.log(".:The Good Place:.");
    if (err) {
      // SQL error, but connection OK.
      console.log("  Shirtballs: " + err);
    } else {
      // All is rosey in your garden.
      console.log(result.recordset);
      data = result;
    }
  });
});
sql.on("error", (err) => {
  // Connection borked.
  console.log(".:The Bad Place:.");
  console.log("  Fork: " + err);
});
}

const SQLEdtiConnection = ({nameToAsk, name,age, college})=>{
  sql.connect(config, (err) => {
  new sql.Request().query(`update users set name= (${name},age = ${age},college = ${college}) where name = ${nameToAsk}`, (err, result) => {
    console.log(".:The Good Place:.");
    if (err) {
      // SQL error, but connection OK.
      console.log("  Shirtballs: " + err);
    } else {
      // All is rosey in your garden.
      console.log(result.recordset);
      data = result;
    }
  });
});
sql.on("error", (err) => {
  // Connection borked.
  console.log(".:The Bad Place:.");
  console.log("  Fork: " + err);
});
}

const SQLCreateRowConnection = ({name,age, college})=>{
  sql.connect(config, (err) => {
  new sql.Request().query(`insert into users values (${name}, ${age}, ${college})`, (err, result) => {
    console.log(".:The Good Place:.");
    if (err) {
      // SQL error, but connection OK.
      console.log("  Shirtballs: " + err);
    } else {
      // All is rosey in your garden.
      console.log(result.recordset);
      data = result;
    }
  });
});
sql.on("error", (err) => {
  // Connection borked.
  console.log(".:The Bad Place:.");
  console.log("  Fork: " + err);
});
}

const SQLDeleteRowConnection = ({nameToAsk})=>{
  sql.connect(config, (err) => {
  new sql.Request().query(`delete from users where name=${nameToAsk})`, (err, result) => {
    console.log(".:The Good Place:.");
    if (err) {
      // SQL error, but connection OK.
      console.log("  Shirtballs: " + err);
    } else {
      // All is rosey in your garden.
      console.log(result.recordset);
      data = result;
    }
  });
});
sql.on("error", (err) => {
  // Connection borked.
  console.log(".:The Bad Place:.");
  console.log("  Fork: " + err);
});
}

const user = {
  name: "Truly Mittal",
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
  getUser: () => {
    console.log(data.recordset);
    return user;
  },
  getFromSq: () =>{
    SQLconnection()
    return data.recordset
  },
  editFromSq: ({nameToAsk, name, age, college}) =>{
    SQLEdtiConnection(nameToAsk ,name, age, college)
    return data.recordset
  },
  createRowSq: ({name, age, college}) =>{
    SQLCreateRowConnection(name, age, college)
    return data.recordset
  },
  deleteRowSq: ({nameToAsk}) =>{
    SQLDeleteRowConnection(nameToAsk)
    return data.recordset
  },
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
