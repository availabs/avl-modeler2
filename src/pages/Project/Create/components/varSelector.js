import React, { useState, useEffect } from "react";
import Select from "react-select";

const VarSelector = ({ layer, setSelectedVar }) => {
  const [variables, setVariables] = useState({});
  // const [variables, setVariables] = useState({});

  useEffect(() => {
    const getVariables = async () => {
      const response = await fetch("/data/model_variables.json");
      const data = await response.json();
      console.log("meta--", data);

      setVariables(data);

      // handleChange(event) {
      //     setVariables({name: event.target.value});
      //   }
    };
    getVariables();
  }, []);

  console.log("variables---", variables);

  let variablesNew = Object.entries(variables).map((item) => {
    return { value: item[0], label: item[1].name };
    // console.log("keyvalue", key, value);
  });

  console.log("variablesNew--", variablesNew);

  const colors = {
    primary: "white",
    light: "#aaa",
  };

  const eventHandle = (e) => {
    console.log(
      "event",
      e.map((x) => x.value)
    );

    let selectedKeyArray = e.map((x) => x.value);
    // let selectedVariables = selectedKeyArray.map((key) => variables[key]);
    // console.log("selectedVariables----", selectedVariables);

    setSelectedVar(selectedKeyArray.map((key) => variables[key]));

    // setSelectedVar(variables[e.map((x) => x.value)])
  };

  return (
    <div>
      <Select
        isMulti
        isSearchable
        options={variablesNew}
        onChange={eventHandle}
        placeholder="choose your variable(s)"
        // style={{
        //   backgroundColor: "white",
        //   border: "1px solid #cccccc",
        //   padding: "10px",
        //   marginRight: "10px",
        //   width: "90%",
        //   fontSize: "1em",
        //   color: "#3A3636",
        // }}

        // style={{
        //   backgroundColor: "white",
        //   border: "1px solid #cccccc",
        //   padding: "10px",
        //   marginRight: "50px",
        //   width: "90%",
        //   fontSize: "1em",
        //   color: "#3A3636",
        // }}
      ></Select>
      <label style={{ width: "60%" }}>
        {/* <div
          style={{
            fontSize: "1.15em",
            fontWeigh: 600,
            color: colors.light,
            borderBottom: `2px solid ${colors.light}`,
            paddingBottom: 10,
          }}
        >
          Choose a variable
    
        </div> */}
        {/* 
        <select
          onChange={(e) => setSelectedVar(variables[e.target.value])}
          style={{
            backgroundColor: "white",
            border: "1px solid #cccccc",
            padding: "10px",
            marginRight: "10px",
            width: "90%",
            fontSize: "1em",
            color: "#3A3636",
          }}
          //   className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <option key={0} value={""}>
            choose a variable
          </option>

          {Object.keys(variables).map((k, i) => {
            return (
              <option key={i} value={k}>
                {variables[k].name}
              </option>
            );
          })}
        </select> */}
      </label>
    </div>
  );
};

export default VarSelector;
