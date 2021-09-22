const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');


const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;

  let user = users.find(user => user.username === username);

  if (!user)
    return res.status(404).json({ Error: "User not found" })

  req.user = user;

  return next();

}

app.post('/users', (req, res) => {

  try {
    const { name, username } = req.body;

    if ((name && username) === undefined || (name && username) == '')
      return res.status(400).json({ message: "Invalid user credentials for registration" });

    let userExists = users.find(user => user.username === username);

    if (userExists)
      return res.status(400).json({ error: "Username already exists" });


    let user = {
      id: uuidv4(),
      name,
      username,
      todos: []
    }

    users.push(user);

    return res.status(201).json(user);
  }
  catch (err) {
    console.log("err", err);
    return res.status(500).json({ message: "Error creating user" });
  }

});

app.get('/todos', checksExistsUserAccount, (req, res) => {

  try {
    const { user } = req;

    return res.json(user.todos);

  }
  catch (err) {
    console.log("err", err);
    return res.status(400).json({ message: "Error for consulting todos" })
  }
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  try {
    const { user } = req;
    const { title, deadline } = req.body;

    const todo = {
      id: uuidv4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date(),
    }

    user.todos.push(todo);

    return res.status(201).json(todo);

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error creating todo" });
  }

});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  try {
    const { user } = req;
    const { title, deadline } = req.body;
    const { id } = req.params;

    const todo = user.todos.find(todo => todo.id === id);

    if (!todo)
      return res.status(404).json({ error: "Todo not found" })

    todo.title = title;
    todo.deadline = new Date(deadline);

    return res.json(todo);

  } catch (err) {
    console.log("err", err);
    return res.status(500).json({ message: "Error update todos" });
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {

  try {
    const { user } = req;
    const { id } = req.params;

    const todo = user.todos.find(todo => todo.id === id);

    if (!todo)
      return res.status(404).json({ error: "Todo not found" })

    todo.done = true;

    return res.json(todo);

  } catch (err) {
    console.log("err", err);
    return res.status(500).json({ message: "Error update todos" });
  }

});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  try {

    const { user } = req;
    const { id } = req.params;

    const todoIndex = user.todos.findIndex(todo => todo.id === id);

    if (todoIndex === -1)
      return res.status(404).json({ error: "Todo not found" });


    user.todos.splice(todoIndex, 1);

    return res.status(204).json();


  } catch (err) {
    console.log("err", err);
    return res.status(500).json({ message: "Error delete todos" });
  }

});

module.exports = app;