const fetch = require("node-fetch");
const data = require("./popsynthconfig");

const requestCreate = (data) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  fetch(`http://localhost:5000/project/create_1`, options)
    .then((r) => r.json())
    .then((d) => console.log("create project response", d));
};

requestCreate(data);
