import React, { useState, useEffect } from "react";
import Select, { components } from "react-select";
import makeAnimated from "react-select/animated";

const VarSelector = ({ layer, setSelectedVar }) => {
  const [variables, setVariables] = useState({});
  const [fixedVariables, setFixedVariables] = useState([]);

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

  let variablesNew = Object.entries(variables).map((item, i) => {
    return {
      value: item[0],
      label: item[1].name,
      key: i,
      isFixed: item[1].isFixed,
    };
    // console.log("item--", item);
    // console.log("keyvalue", key, value, isFixed);
  });

  console.log("variablesNew--", variablesNew);

  const colors = {
    primary: "white",
    light: "#aaa",
  };

  const handleChange = (e, option) => {
    console.log(
      "event",
      e,
      e.map((x) => x.value),
      option
    );

    // if (option.removedValue && option.removedValue.isFixed) return;

    let selectedKeyArray = e.map((x) => x.value);
    // let selectedVariables = selectedKeyArray.map((key) => variables[key]);
    // console.log("selectedVariables----", selectedVariables);
    // setSelectedVar(variables[option.option.value]);
    setSelectedVar(selectedKeyArray.map((key) => variables[key]));
  };
  // const handleFixedVar = (e, option) => {
  //   console.log("option", e, option);

  //   //  if (option.removedValue && option.removedValue.isFixed) return;
  // setFixedVariables(e)

  //   // let selectedKeyArray = e.map((x) => x.value);
  //   // let selectedVariables = selectedKeyArray.map((key) => variables[key]);
  //   // console.log("selectedVariables----", selectedVariables);
  //   // setSelectedVar(variables[option.option.value]);
  //   // setSelectedVar(selectedKeyArray.map((key) => variables[key]));
  // };

  const twoCalls = (e, option) => {
    this.handleChange(e, option);
    this.handleFixedVar(e, option);
  };

  const fixedValue = "1";

  const MultiValueRemove = (props) => {
    console.log("props---", props);
    if (props.data.isFixed) {
      return null;
    }
    return <components.MultiValueRemove {...props} />;
  };

  return (
    <div className="mt-1 mb-2 ml-auto px-2 py-2">
      <Select
        isMulti
        // defaultValue={[
        //   variablesNew[0],
        //   variablesNew[1],
        //   variablesNew[3],
        //   variablesNew[4],
        // ]}
        // isClearable={false}
        isClearable={!fixedVariables.some((a) => a.isFixed)}
        options={variablesNew}
        // components={{ MultiValueRemove }}
        // onChange={(e) => {
        //   handleChange(e);
        //   handleFixedVar(e);
        // }}
        // onChange={handleChange}
        onChange={twoCalls}
        placeholder="choose your variable(s)"

        // isSearchable
        // autoFocus
        // components={makeAnimated()}

        // defaultValue={variablesNew.find((value) => value.key === fixedValue)}
        // isClearable={variablesNew.some((v) => !v.isFixed)}

        // className="basic-multi-select"
        // classNamePrefix="select"
        // style={{
        //   backgroundColor: "white",
        //   border: "1px solid #cccccc",
        //   padding: "10px",
        //   marginRight: "10px",
        //   width: "90%",
        //   fontSize: "1em",
        //   color: "#3A3636",
        // }}
      ></Select>
    </div>
  );
};

export default VarSelector;
