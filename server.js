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
let data = "";
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


input UserInput {
  student_name: String!
  age: Int!
  college: String!
}
input UserCreateInput {
  id:Int!
  student_name: String!
  age: Int!
  college: String!
}

input UserEditInput {
  id: Int!
  student_name: String!
  age: Int!
  college: String!
}


type Mutation {
setMessage(newMessage: String): String
createUser(user: UserInput): User

editFromSq(user: UserEditInput): User
createRowSq (user: UserCreateInput): User
deleteRowSq (id: Int): User
}

`);
// createUser(name: String, age: Int!, college: String!): User

const config = {
  connectionString:
    "Driver=SQL Server;Server=MENIR\\SQLEXPRESS;Database=graphQL;Trusted_Connection=true;",
};
const SQLconnection = () => {
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
};

const SQLEdtiConnection = (id, name, age, college) => {
  sql.connect(config, (err) => {
    new sql.Request().query(
      `update users set student_name='${name}',age = ${age},college = '${college}' where id = ${id}`,
      (err, result) => {
        console.log(".:The Good Place:.");
        if (err) {
          // SQL error, but connection OK.
          console.log("  Shirtballs: " + err);
        } else {
          // All is rosey in your garden.
          if (result.rowsAffected[0] == 1) data = "succeded";
          else data = "fail";
        }
      }
    );
  });
  sql.on("error", (err) => {
    // Connection borked.
    console.log(".:The Bad Place:.");
    console.log("  Fork: " + err);
  });
};

const SQLCreateRowConnection = (id, name, age, college ) => {
  sql.connect(config, (err) => {
    // console.log(id, name, age, college);
    new sql.Request().query(
      `insert into users values (${id}, '${name}', ${age}, '${college}')`,
      (err, result) => {
        console.log(".:The Good Place:.");
        if (err) {
          // SQL error, but connection OK.
          console.log("  Shirtballs: " + err);
          // data = err
        } else {
          // All is rosey in your garden.
          console.log(result);
          data = result;
        }
      }
    );
  });
  sql.on("error", (err) => {
    // Connection borked.
    console.log(".:The Bad Place:.");
    console.log("  Fork: " + err);
  });
};

const SQLDeleteRowConnection = (id) => {
  sql.connect(config, (err) => {
    console.log(id);
    new sql.Request().query(
      `delete from users where id=${id}`,
      (err, result) => {
        console.log(".:The Good Place:.");
        if (err) {
          // SQL error, but connection OK.
          console.log("  Shirtballs: " + err);
        } else {
          // All is rosey in your garden.
          console.log(result.recordset);
          data = result;
        }
      }
    );
  });
  sql.on("error", (err) => {
    // Connection borked.
    console.log(".:The Bad Place:.");
    console.log("  Fork: " + err);
  });
};

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
    return args.user;
  },
  getUser: () => {
    console.log(data.recordset);
    return user;
  },
  getFromSq: () => {
    SQLconnection();
    return data.recordset;
  },
  editFromSq: (args) => {

    SQLEdtiConnection(
      args.user.id,
      args.user.student_name,
      args.user.age,
      args.user.college
    );
    return args.user
  },
  createRowSq: (args) => {
    SQLCreateRowConnection(args.user.id, args.user.student_name, args.user.age, args.user.college);
    // return args.user;
    console.log(args.user);
  },
  deleteRowSq: (args) => {
    SQLDeleteRowConnection(args.id);
    return args;
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
