import React, { useState, useEffect, useMemo, Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const VarSelector = ({ layer, setSelectedVar }) => {
  const [variables, setVariables] = useState({});

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
  //   selectedVar = variables[selected].acs_vars;
  //   console.log("selectedVariable----", selectedVar.acs_vars);

  // let variables = fetch('/popsynth_vars/vars.json')
  //              .then(r => r.json())
  //              .then(data => {
  //
  //                console.log('fdata---',data, data.HINCP.name );

  //                //  setVariables =  Object.values(data).map (d => d)
  //                // return Object.values(data).map (d => d)

  //           })

  // handleChange(event) {
  //     setVariables({name: event.target.value});
  //   }

  const colors = {
    primary: "white",
    light: "#aaa",
  };

  return (
    <div>
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
          <p>selected variables: {variables} </p>
        </div> */}

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
          {/* <br>selected Variables: {variables}</br> */}
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
        </select>
      </label>
    </div>

    // <Menu as="div" className="relative inline-block text-left">
    //   <div className="w-full flex justify-end ">
    //     <Menu.Button className="inline-flex justify-end w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
    //       Options
    //       {/* <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" /> */}
    //     </Menu.Button>
    //   </div>

    //   <Transition
    //     as={Fragment}
    //     enter="transition ease-out duration-100"
    //     enterFrom="transform opacity-0 scale-95"
    //     enterTo="transform opacity-100 scale-100"
    //     leave="transition ease-in duration-75"
    //     leaveFrom="transform opacity-100 scale-100"
    //     leaveTo="transform opacity-0 scale-95"
    //   >
    //     <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
    //       <div className="py-1">
    //         <Menu.Item>
    //           {({ active }) => (
    //             <a
    //               href="#"
    //               className={classNames(
    //                 active ? "bg-gray-100 text-gray-900" : "text-gray-700",
    //                 "block px-4 py-2 text-sm"
    //               )}
    //             >
    //               Account settings
    //             </a>
    //           )}
    //         </Menu.Item>
    //         <Menu.Item>
    //           {({ active }) => (
    //             <a
    //               href="#"
    //               className={classNames(
    //                 active ? "bg-gray-100 text-gray-900" : "text-gray-700",
    //                 "block px-4 py-2 text-sm"
    //               )}
    //             >
    //               Support
    //             </a>
    //           )}
    //         </Menu.Item>
    //         <Menu.Item>
    //           {({ active }) => (
    //             <a
    //               href="#"
    //               className={classNames(
    //                 active ? "bg-gray-100 text-gray-900" : "text-gray-700",
    //                 "block px-4 py-2 text-sm"
    //               )}
    //             >
    //               License
    //             </a>
    //           )}
    //         </Menu.Item>
    //         <form method="POST" action="#">
    //           <Menu.Item>
    //             {({ active }) => (
    //               <button
    //                 type="submit"
    //                 className={classNames(
    //                   active ? "bg-gray-100 text-gray-900" : "text-gray-700",
    //                   "block w-full text-left px-4 py-2 text-sm"
    //                 )}
    //               >
    //                 Sign out
    //               </button>
    //             )}
    //           </Menu.Item>
    //         </form>
    //       </div>
    //     </Menu.Items>
    //   </Transition>
    // </Menu>
  );
};

export default VarSelector;
