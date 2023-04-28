const express = require("express");

const app = express();

//All your code goes here

const fs = require("fs");
var sessionStorage = null;

function findUserById(id, callback) {
  fs.readFile("database/users.json", (err, usersData) => {
    if (err) {
      console.error(err);
      callback(err);
      return;
    }
    const users = JSON.parse(usersData);
    const user = users.find((u) => u.id === id);
    if (user) {
      callback(null, user);
    } else {
      callback(new Error(`User with ID ${id} not found`));
    }
  });
}

function verifyUser(username, password, callback) {
  fs.readFile("database/users.json", (err, usersData) => {
    if (err) {
      console.error(err);
      callback(err);
      return;
    }
    const users = JSON.parse(usersData);
    const user = users.find((u) => user.username === username && user.password === password);
    if (!user) {
      callback(new Error(`User with username ${username} and password ${password} not found`));
      return;
    }
    if (!user.id) {
      callback(new Error(`User with username ${username} and password ${password} has no ID`));
      return;
    }
    callback(null, user);
    sessionStorage = user.id;
    window.location.href = 'public/account.html'; //Goes to account page when log in successful
  });
}

function logoutUser() {
  sessionStorage = null;
}

function createUser(username, password, id) {
  const usersData = fs.readFileSync("database/users.json");
  const users = JSON.parse(usersData);

  //Check if user with the same username already exists
  if (users.some(user => user.username === username)) {
    console.log("User with this username already exists");
    return;
  }

  //Create new user object with provided id, username, and password
  const newUser = {
    id,
    username,
    password,
    courses: []
  };

  //Add new user to the users array
  users.push(newUser);

  //Write updated users data back to the file
  fs.writeFileSync("database/users.json", JSON.stringify(users));

  console.log("New user created:", newUser);
  return newUser;
}

function createUserWithCourses(username, password, id, courseCode, courseTitle, courseDesc) {
  const newUser = createUser(username, password, id);
  if (newUser) {
    addCourseToUser(newUser.id, courseCode, courseTitle, courseDesc);
    console.log("New user created with course:", newUser);
    return newUser;
  }
}

function addCourseToUser(userId, courseCode, courseTitle, courseDesc) {
  const usersData = fs.readFileSync("database/users.json");
  const users = JSON.parse(usersData);

  const user = users.find(user => user.id === userId);
  if (!user) {
    console.log("User not found");
    return;
  }

  const course = user.courses.find(course => course.code === courseCode);
  if (course) {
    console.log("Course already exists for user");
    return;
  }

  user.courses.push({
    code: courseCode,
    title: courseTitle,
    description: courseDesc
  });

  fs.writeFileSync("database/users.json", JSON.stringify(users));
  console.log("Success! Course added to user:", user);
}

app.use(express.static("public"));

app.get("/", (req, res) => {
  fs.readFile("database/courses.json", (err, coursesData) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading courses data");
      return;
    }
    const courses = JSON.parse(coursesData);

    //Gets query parameters from the request URL

    const codeFilter = req.query.code;
    const numFilter = req.query.num;

    //Filters courses by code or num if query parameters are present
    let filteredCourses = courses;
    if (codeFilter) {
      filteredCourses = filteredCourses.filter((c) => c.code === codeFilter);
    }
    if (numFilter) {
      filteredCourses = filteredCourses.filter((c) =>
        c.code.startsWith(numFilter)
      );
    }

    const myElement = document.getElementById("courses");
    myElement.innerText = JSON.stringify(filteredCourses);
  });
});

app.get("/users/:id", (req, res) => {
  const userId = req.params.id;
  findUserById(userId, (err, user) => {
    if (err) {
      console.error(err);
      res.status(404).send(err.message);
      return;
    }
    res.send(user);
  });
});

app.get("/users/:username/:password", (req, res) => {
  const username = req.params.username;
  const password = req.params.password;
  verifyUser(username, password, (err, user) => {
    if (err) {
      console.error(err);
      res.status(404).send(err.message);
      return;
    }
    res.send(user);
  });
});

function createUser(username, password, id) {
  const usersData = fs.readFileSync("database/users.json");
  const users = JSON.parse(usersData);
  
  //Check if user with the same username already exists
  if (users.some(user => user.username === username)) {
    console.log("User with this username already exists");
    return;
  }
  
  //Create new user object with provided id, username, and password
  const newUser = {
    id,
    username,
    password
  };
  
  //Add new user to the users array
  users.push(newUser);
  
  //Write updated users data back to the file
  fs.writeFileSync("database/users.json", JSON.stringify(users));
  
  console.log("New user created:", newUser);
  return newUser;
}

function deleteCourseFromUser(userId, courseCode) {
  const usersData = fs.readFileSync("database/users.json");
  const users = JSON.parse(usersData);
  
  const user = users.find(user => user.id === userId);
  if (!user) {
    console.log("User not found");
    return;
  }
  
  const courseIndex = user.courses.findIndex(course => course.code === courseCode);
  if (courseIndex === -1) {
    console.log("Course not found for user");
    return;
  }
  
  user.courses.splice(courseIndex, 1);
  
  fs.writeFileSync("database/users.json", JSON.stringify(users));
  console.log("Course deleted from user:", user);
}

app.listen(8080, () => {
  console.log("Server listening on port 8080");
});

//Do not remove the following line. It allows the test suite to start
//multiple instances of your server on different ports.

module.exports = app;

//cd ~/Desktop/Work/WebApp/NathansRepository
