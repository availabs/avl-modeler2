import React, { useState, Fragment } from "react";
import { Dialog, Transition, Menu } from "@headlessui/react";
import flatten from "lodash.flatten";
import Papa from "papaparse";
import { useFalcor } from "modules/avl-components/src";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import controlConfigJson from "./controlConfig.json";
import CreateNewProject from "./createNewProject";
import VarSelector from "./varSelector_single";
import { stringify } from "postcss";

//let controlConfigJson = require('./control_config.json')  //if public data folder
const host = "http://localhost:5000/";
const team = [
  {
    name: "Tom Cook",
    email: "tom.cook@example.com",
    href: "#",
    imageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Whitney Francis",
    email: "whitney.francis@example.com",
    href: "#",
    imageUrl:
      "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Leonard Krasner",
    email: "leonard.krasner@example.com",
    href: "#",
    imageUrl:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Floyd Miles",
    email: "floy.dmiles@example.com",
    href: "#",
    imageUrl:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Emily Selman",
    email: "emily.selman@example.com",
    href: "#",
    imageUrl:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
];

const DataGenerator = ({ layer }) => {
  console.log("layer----", layer);
  const { falcor, falcoCache } = useFalcor();
  const [process, setProcess] = useState(""); // hook!!
  //const [seedData, setSeedData] = useState({});
  const [open, setOpen] = useState(true);

  const [selectedVar, setSelectedVar] = useState([]);

  console.log(
    "Selected Var----",
    selectedVar
    // flatten(Object.values(selectedVar.acs_vars))
  );

  // Object.values(variables[e.target.value].acs_vars)

  const startProcess = async () => {
    setProcess("working");

    console.time("generate crosswalk");
    let crosswalkData = generateCrosswalk();
    console.timeEnd("generate crosswalk");

    console.time("generate seed");
    let seedData = await generateSeedData(); // because fetch--promise
    console.timeEnd("generate seed");

    console.time("generate control");
    let controlData = await generateControl(crosswalkData); // because fetch--promise
    console.timeEnd("generate control");

    console.time("generate controlControl");
    // let controlConfig = generateControlConfig(controlData);
    //expression is hard to generate so decide to manually creat object json and import
    let controlConfig = controlConfigJson;
    console.timeEnd("generate controlControl");

    console.log(
      "getting data----",
      crosswalkData,
      seedData,
      controlData,
      controlConfig
    );

    //save each Data(inputs data) as zip file
    //how to --https://github.com/Stuk/jszip
    var zip = new JSZip();
    zip.file("geo_cross_walk.csv", Papa.unparse(crosswalkData)); //use Papa.unparse to put json back to csv
    zip.file("seed_households.csv", Papa.unparse(seedData.household));
    zip.file("seed_persons.csv", Papa.unparse(seedData.person));
    zip.file("control_totals_bg.csv", Papa.unparse(controlData.control_bgs));
    zip.file(
      "control_totals_tract.csv",
      Papa.unparse(controlData.control_tracts)
    );
    zip.file("controls.csv", Papa.unparse(controlConfig));

    let zipFile = await zip.generateAsync({ type: "blob" });
    saveAs(zipFile, "pop_synth_input_new.zip");

    setProcess("finished");
  };

  const generateCrosswalk = () => {
    // TAZ	BLKGRP	STATEFP	COUNTYFP	TRACTCE	GEOID	NAME	NAMELSAD	PUMA	REGION

    console.log("selectedPumasBgs", layer.state.selectedPumasBgs);

    let output = Object.keys(layer.state.selectedPumasBgs).map((key) => {
      // console.log("test---", key)
      return layer.state.selectedPumasBgs[key].map((bg) => {
        // console.log('BLKGRP',bg);
        return {
          BG: bg.slice(-7), //last 5 digits of bg
          BLKGRP: bg,
          STATEFP: bg.slice(0, 2), //first 2 dgitsd of bg
          COUNTYFP: parseInt(bg.slice(2, 5)),
          TRACTCE: parseInt(bg.slice(5, 11)),
          GEOID: bg.slice(0, 11),
          NAME: parseInt(bg.slice(5, 11)),
          NAMELSAD: `Census Tract ${parseInt(bg.slice(5, 11))}`,
          PUMA: key.slice(3, 7),
          REGION: 1,
        };
      });
      //console.log('output--', data)
      // return data
    });
    console.log("outputCrosswalk---", output);
    return flatten(output);
  };

  //Seed data start here------------------------------------------

  const generateSeedData = () => {
    console.log("fetching households");

    let selectedPumas = layer.state.selectedPumas;

    // console.log('selectedPumas---', selectedPumas)

    const household = selectedPumas.map((pumaId) => {
      let puma_id = pumaId.slice(2, 7);
      let url = `${host}pums/psam/h/${puma_id}`;
      return fetch(url)
        .then((r) => r.json())
        .then((d) => {
          return {
            type: "h",
            data: d,
          };
        });
    });

    const persons = selectedPumas.map((pumaId) => {
      let puma_id = pumaId.slice(2, 7);
      let url = `${host}pums/psam/p/${puma_id}`;
      return fetch(url)
        .then((r) => r.json())
        .then((d) => {
          return {
            type: "p",
            data: d,
          };
        });
    });

    console.time("load pums");
    // console.log("api-return---", household, persons);

    return Promise.all([...household, ...persons]).then((pumsData) => {
      console.timeEnd("load pums");
      // console.log("api-Data-return-----", pumsData);

      let hhdata = flatten(
        pumsData.filter((d) => d.type === "h").map((d) => d.data)
      );

      let pdata = flatten(
        pumsData.filter((d) => d.type === "p").map((d) => d.data)
      );

      // b/c papa parse output = { data: [ ... ], errors: [ ... ], meta: {	... }}

      console.log("api-return-seed data simple", hhdata, pdata);

      let hhindex = 1;

      let hhnumLookup = hhdata.reduce((lookup, hh) => {
        if (!lookup[hh.SERIALNO]) {
          lookup[hh.SERIALNO] = hhindex;
          hh.hhnum = hhindex;
          hhindex += 1;
        }
        hh.hhnum = lookup[hh.SERIALNO];
        return lookup;
      }, {});

      console.log("after hhnum", hhdata, hhnumLookup);

      pdata.forEach((d) => (d.hhnum = hhnumLookup[d.SERIALNO])); // better than .map b/c no need to return

      // let test = pdata.map(d => d.hhnum = hhnumLookup[d.SERIALNO] )

      console.log("after p.hhnum", pdata);

      //console.log('seedPdata----', pdata,pdata[0], flatten(pdata), newpdata, test)
      //console.log('seedData_flatten' ,flatten(hhdata), pdata[0], flatten(pdata)),

      return {
        household: flatten(hhdata), // flatten(hhdata),
        person: flatten(pdata), //flatten(pdata)
      };
    });
  };
  // console.log("output----", process, generateCrosswalk());

  // Control data start here ------------------------------

  const generateControl = (crosswalkData) => {
    let BgsPuma = crosswalkData.reduce((acc, obj) => {
      acc[obj.BLKGRP] = obj.PUMA;
      return acc;
    }, {});

    let TractsPuma = crosswalkData.reduce((acc, obj) => {
      acc[obj.GEOID] = obj.PUMA;
      return acc;
    }, {});
    console.log("BgsPuma---", BgsPuma, TractsPuma);

    // create census api call for bgs with variable using falcor
    // create census api call for tracts with variables
    // falcor.get(['acs',${geoids},${years},${censusvars}]]) // falcor.get function format
    // parse returned data into control format

    console.log(
      "Selected ACS----",
      selectedVar
      // flatten(Object.values(selectedVar.acs_vars), selectedVar.binsCompare)
    );

    let selectedACSKeys = flatten(Object.values(selectedVar.acs_vars));

    // let selectedACSKeys = selectedVar.map((selectedVariable) =>
    //   flatten(Object.values(selectedVariable.acs_vars))
    // );

    selectedACSKeys.push(
      "B01003_001E",
      "B25001_001E",
      "S2501_C01_001E",
      "S0101_C01_001E"
    );

    console.log("selectedACSKeys", selectedACSKeys);

    let bgs = Object.values(layer.state.selectedPumasBgs);
    let flattenBgs = flatten(bgs); //.filter((r, i) => i < 30)

    let tracts = flattenBgs.map((d) => d.slice(0, -1));
    let uniqueTracts = [...new Set(tracts)];

    // console.log(
    //   "bgs-----",
    //   bgs,
    //   flattenBgs,
    //   flattenBgs.length,
    //   uniqueTracts,
    //   uniqueTracts.length
    // );

    console.time("call acs");

    // console.log(
    //   "compare----",
    //   [...Object.values(tract_cenvars)],
    //   selectedACSKeys
    // );

    return falcor
      .chunk(
        //instead of falcor.get, use falcor.chunk & return falcor.getCache b/c long http call length
        // ["acs", [...uniqueTracts], [2019], [...Object.values(tract_cenvars)]],
        // ["acs", [...flattenBgs], [2019], [...Object.values(bg_cenvars)]],
        ["acs", [...uniqueTracts], [2019], selectedACSKeys],
        ["acs", [...flattenBgs], [2019], selectedACSKeys],
        { chunkSize: 200 }
      )
      .then((d) => {
        console.timeEnd("call acs");
        let acsFalcorData = falcor.getCache();
        console.log("acsFalcorData", acsFalcorData);
        return acsFalcorData;
      })

      .then((output) => {
        let tractData = Object.values(output).map((d) => {
          let geoIds = Object.keys(d);
          let acsVarKeysValuesArray = Object.entries(selectedVar.acs_vars);
          let acsVarName = selectedVar.var;
          // let acsVarValuesArray = Object.values(selectedVar.acs_vars);
          // let acsVarObject = selectedVar;

          console.log(
            "test------",
            d,
            acsVarKeysValuesArray,
            acsVarName
            // acsVarValuesArray,
            // acsVarObject
          );

          return geoIds
            .filter((geoId) => geoId.length === 11)
            .map((geoId) => {
              let ACSOutput = Object.values(d[geoId]);
              console.log("ACSOutputValues---", ACSOutput);

              let binnedVarNamesKeys = acsVarKeysValuesArray.map((d) => {
                //refine this code to find value
                let binnedVarName = acsVarName + d[0];
                let binnedVarKeys = Object.keys(ACSOutput[0]).filter((item) =>
                  flatten(d[1]).includes(item)
                );

                console.log("binnedVars", binnedVarName, binnedVarKeys);

                return {
                  binned_var_name: binnedVarName,
                  binned_var_key: binnedVarKeys,
                };
              });

              console.log("binnedVarNamesKeys----", binnedVarNamesKeys);

              let binnedVarNamesValues = binnedVarNamesKeys.map((d) => {
                let binnedACSName = Object.values(d)[0];
                let binnedACSKeys = Object.values(d)[1];
                // let ACSOutput = ACSOutput;
                let binnedACSValue = Object.keys(ACSOutput[0])
                  .filter((key) => binnedACSKeys.includes(key))
                  .reduce((sum, key) => sum + ACSOutput[0][key], 0);

                let binnedACSValueTest = Object.keys(ACSOutput[0])
                  .filter((key) => binnedACSKeys.includes(key))
                  .reduce((obj, key) => {
                    obj[key] = ACSOutput[0][key];
                    return obj;
                  }, {});

                console.log(
                  "binnedACSKey",
                  d,
                  binnedACSName,
                  binnedACSKeys,
                  ACSOutput,
                  binnedACSValue
                );

                return {
                  binned_var_name: binnedACSName,
                  binned_var_value: binnedACSValue,
                  // binned_var_value_test: binnedACSValueTest,
                  HHBase_Tracts: ACSOutput[0]["S2501_C01_001E"],
                  PopBase_Tracts: ACSOutput[0]["S0101_C01_001E"],
                };
              });

              console.log(
                "TractsBinnedVarNamesValues---",
                binnedVarNamesValues
              );

              let binnedVarNamesValuesNew = binnedVarNamesValues.map((d) => {
                let obj = {};
                let name = Object.values(d)[0];
                let value = Object.values(d)[1];

                obj[name] = value;
                return obj;
              });

              let binnedVarNamesValuesNewFinal = Object.assign(
                {},
                ...binnedVarNamesValuesNew
              );

              // let binnedVarNamesValuesNew1 = JSON.stringify(
              //   ...binnedVarNamesValuesNew
              // );
              // // let binnedVarNamesValuesNew2 = binnedVarNamesValuesNew1.map(
              // //   (obj) => obj.replace(/{}/g, "")
              // // );
              // // let binnedVarNamesValuesNew2 = binnedVarNamesValuesNew.map(
              // //   (obj) => obj.join()
              // // );
              // // let binnedVarNamesValuesNew2 = binnedVarNamesValuesNew.map(
              // //   (obj) => JSON.stringify(obj).replace(/{}/g, "")
              // // );
              // let binnedVarNamesValuesNew2 = binnedVarNamesValuesNew.map(
              //   (obj) => JSON.stringify(obj).replace(/[{}]/g, "")
              // );
              // // let binnedVarNamesValuesNew2 = binnedVarNamesValuesNew.map(
              // //   (obj) => JSON.stringify(obj).join(",")
              // // )

              console.log(
                "TractsBinnedVarNamesValuesNewFinal--",
                binnedVarNamesValuesNew,
                ...binnedVarNamesValuesNew,
                binnedVarNamesValuesNewFinal
              );

              return {
                STATEFIPS: geoId.slice(0, 2),
                COUNTY: geoId.slice(2, 5),
                TRACT: geoId.slice(5, 11),
                TRACTGEOID: geoId,
                PUMA: TractsPuma[geoId],
                REGION: 1,
                HHBASE: binnedVarNamesValues[0]["HHBase_Tracts"],
                POPBASE: binnedVarNamesValues[0]["PopBase_Tracts"],
                ...binnedVarNamesValuesNewFinal,
              };
            });
        });

        let BgData = Object.values(output).map((d) => {
          let geoIds = Object.keys(d);
          let acsVarKeysValuesArray = Object.entries(selectedVar.acs_vars);
          let acsVarName = selectedVar.var;

          return geoIds
            .filter((geoId) => geoId.length === 12)
            .map((geoId, i) => {
              let ACSOutput = Object.values(d[geoId]);

              console.log("ACSOutputValues---", ACSOutput);

              let binnedVarNamesKeys = acsVarKeysValuesArray.map((d) => {
                //refine this code to find value
                let binnedVarName = acsVarName + d[0];
                let binnedVarKeys = Object.keys(ACSOutput[0]).filter((item) =>
                  flatten(d[1]).includes(item)
                );

                console.log("binnedVars", binnedVarName, binnedVarKeys);

                return {
                  binned_var_name: binnedVarName,
                  binned_var_key: binnedVarKeys,
                  HHBase_Tracts: ACSOutput[0]["B25001_001E"],
                  PopBase_Tracts: ACSOutput[0]["B01003_001E"],
                };
              });

              console.log("binnedVarNamesKeys----", binnedVarNamesKeys);

              let binnedVarNamesValues = binnedVarNamesKeys.map((d) => {
                let binnedACSName = Object.values(d)[0];
                let binnedACSKeys = Object.values(d)[1];
                // let ACSOutput = ACSOutput;
                let binnedACSValue = Object.keys(ACSOutput[0])
                  .filter((key) => binnedACSKeys.includes(key))
                  .reduce((sum, key) => sum + ACSOutput[0][key], 0);

                let binnedACSValueTest = Object.keys(ACSOutput[0])
                  .filter((key) => binnedACSKeys.includes(key))
                  .reduce((obj, key) => {
                    obj[key] = ACSOutput[0][key];
                    return obj;
                  }, {});

                console.log(
                  "binnedACSKey",
                  d,
                  binnedACSName,
                  binnedACSKeys,
                  ACSOutput,
                  binnedACSValue
                );

                return {
                  binned_var_name: binnedACSName,
                  binned_var_value: binnedACSValue,
                  HHBase_Bgs: ACSOutput[0]["B25001_001E"],
                  PopBase_Bgs: ACSOutput[0]["B01003_001E"],
                };
              });

              console.log("BgsBinnedVarNamesValues---", binnedVarNamesValues);

              let binnedVarNamesValuesNew = binnedVarNamesValues.map((d) => {
                let obj = {};
                let name = Object.values(d)[0];
                let value = Object.values(d)[1];

                obj[name] = value;
                return obj;
              });

              console.log(
                "BgsBinnedVarNamesValuesNew--",
                binnedVarNamesValuesNew
              );

              let binnedVarNamesValuesNewFinal = Object.assign(
                {},
                ...binnedVarNamesValuesNew
              );

              return {
                BG: geoId.slice(-7), //.slice(5, 12)
                BGGEOID: geoId,
                STATEFP: geoId.slice(0, 2),
                COUNTYFP: geoId.slice(2, 5),
                TRACT: geoId.slice(5, 11),
                TRACTGEOID: geoId.slice(0, 11),
                PUMA: BgsPuma[geoId],
                REGION: 1,
                MAZ: i + 1,
                xTAZ: geoId.slice(5, 11),
                HHBASE: binnedVarNamesValues[0]["HHBase_Bgs"],
                POPBASE: binnedVarNamesValues[0]["PopBase_Bgs"],
                ...binnedVarNamesValuesNewFinal,
              };
            });
        });
        console.log("Control_data--", BgData, tractData);
        return { control_tracts: tractData[0], control_bgs: BgData[0] };
      });
  };

  return (
    // <div>
    //   {/* <CreateNewProject /> */}

    //   {/* <div className="bg-white shadow overflow-hidden sm:rounded-lg">
    //     <div className="px-4 py-5 sm:px-6">
    //       <h3 className="text-lg leading-6 font-medium text-gray-900">
    //         Create new project
    //       </h3> */}
    //   {/* <p className="mt-1 max-w-2xl text-sm text-gray-500">
    //         Click on PUMAS to define project area
    //       </p> */}
    //   {/* </div>
    //   </div> */}
    //   <div className="w-47 bg-gray-600 text-white">
    //     {/* <div className="w-46 bg-gray-600 text-white"> */}
    //     <table
    //       style={{ marginTop: `3px`, marginLeft: "auto", marginRight: "auto" }}
    //     >
    //       <thead>
    //         <tr style={{ borderBottom: `1px solid` }}>
    //           <th> </th>

    //           <th className="max-w-sm px-0 py-2 text-left  text-sm font-medium text-gray-300">
    //             Create New project
    //           </th>
    //         </tr>
    //       </thead>

    //       <tbody>
    //         <tr>
    //           <td className="max-w-sm px-6 py-2 text-left  text-sm font-medium text-gray-300">
    //             PUMA selected:
    //           </td>

    //           <td className="max-w-sm px-6 py-2 text-right  text-sm font-medium text-gray-300">
    //             {layer.state.selectedPumas
    //               ? layer.state.selectedPumas.length
    //               : 0}
    //           </td>
    //         </tr>
    //         <tr>
    //           <td className="max-w-sm px-6 py-2 text-left  text-sm font-medium text-gray-300">
    //             Number of BGs:
    //           </td>
    //           <td className="max-w-sm px-6 py-2 text-right  text-sm font-medium text-gray-300">
    //             {layer.state.selectedBlockGroups
    //               ? layer.state.selectedBlockGroups.length
    //               : 0}
    //           </td>
    //         </tr>
    //         <tr></tr>
    //         <tr className="max-w-sm px-6 py-2 text-right mt-20 mb-20 text-sm font-medium text-gray-300">
    //           Click on PUMAS to define project area
    //         </tr>
    //       </tbody>
    //     </table>

    //     {/* <div className="max-w-sm px-6 py-2 text-left  text-sm font-medium text-gray-300">
    //     Click on PUMAS to define project area
    //   </div>

    //   <div className="max-w-sm px-6 py-2 text-left  text-sm font-medium text-gray-300">
    //     PUMA selected:{" "}
    //     {layer.state.selectedPumas ? layer.state.selectedPumas.length : 0}
    //   </div>
    //   <div className="max-w-sm px-6 py-2 text-left  text-sm font-medium text-gray-300">
    //     Number of BGs:{" "}
    //     {layer.state.selectedBlockGroups
    //       ? layer.state.selectedBlockGroups.length
    //       : 0}
    //   </div> */}

    //     <VarSelector />

    //     <h4>{process}</h4>
    //     {/* <button
    //       onClick={startProcess}
    //       className={
    //         "hover:bg-gray-700 bg-gray-400 text-white cursor-pointer p-2"
    //       }>
    //          Generate Data
    //     </button> */}

    //     {/* <div className="border border-red-400 w-full flex justify-end"> */}
    //     <div className="w-full flex justify-end ">
    //       <button
    //         type="button"
    //         onClick={startProcess}
    //         className="mt-10 mb-5 ml-auto mr-auto px-5 py-2 border border-transparent text-base font-medium rounded-full shadow-sm text-white hover:bg-gray-700 bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    //       >
    //         Generate Data
    //       </button>
    //     </div>
    //   </div>
    // </div>

    //Test Slide over
    <Transition.Root show={open} as={Fragment}>
      {/* <Dialog
        as="div"
        className="fixed inset-0 overflow-hidden"
        onClose={setOpen}
      > */}
      <div className="absolute inset-0 overflow-hidden">
        {/* <Dialog.Overlay className="absolute inset-0" /> */}

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-500 sm:duration-700"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-500 sm:duration-700"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <div className="pointer-events-auto w-screen max-w-md">
              <form className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                <div className="h-0 flex-1 overflow-y-auto">
                  <div className="bg-gray-600 py-6 px-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      {/* <Dialog.Title className="text-lg font-medium text-white">
                        {" "}
                        Create New Project{" "}
                      </Dialog.Title> */}
                      <h3 className="text-lg font-medium text-white">
                        Create New Project (New)
                      </h3>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className="rounded-md bg-gray-600 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                          onClick={() => setOpen(false)}
                        >
                          <span className="sr-only">Close panel</span>
                          {/* <XIcon className="h-6 w-6" aria-hidden="true" /> */}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className=" mt-4 ml-auto mr-auto">
                    <div>
                      {" "}
                      <h3 className="text-sm font-medium text-gray-900 mt-2 ml-6 ">
                        1. Click on PUMAs at the map to define project area
                      </h3>{" "}
                      <table
                        style={{
                          marginTop: `3px`,
                          marginLeft: "auto",
                          marginRight: "auto",
                        }}
                      >
                        <tbody>
                          <tr>
                            <td className="max-w-sm px-6 py-2 text-left  text-sm font-light text-gray-900">
                              # of PUMAs selected:
                            </td>

                            <td className="max-w-sm px-6 py-2 text-right  text-sm font-light text-gray-900">
                              {layer.state.selectedPumas
                                ? layer.state.selectedPumas.length
                                : 0}
                            </td>
                          </tr>
                          <tr>
                            <td className="max-w-sm px-6 py-2 text-left  text-sm font-light text-gray-900">
                              # of Block Groups selected:
                            </td>
                            <td className="max-w-sm px-6 py-2 text-right  text-sm font-light text-gray-00">
                              {layer.state.selectedBlockGroups
                                ? layer.state.selectedBlockGroups.length
                                : 0}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <h3 className="text-sm font-medium text-gray-900 mt-2 ml-6 ">
                        2. Select a variable
                      </h3>{" "}
                      <div className="flex justify-end">
                        <VarSelector setSelectedVar={setSelectedVar} />
                        {/* <h3 className="text-sm font-medium text-gray-900 mt-2 ml-6 ">
                          Selected Variables: {selected}
                        </h3>{" "} */}
                        {/* <Menu
                          as="div"
                          className="relative inline-block text-left mr-5 "
                        >
                          <Menu.Button
                            className="inline-flex justify- w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 "
                        
                          >
                            Choose a variable
                          
                          </Menu.Button>

                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                              <div className="py-1">
                                {Object.keys(variables).map((k, i) => {
                                  return (
                                    <Menu.Item
                                   
                                    >
                                      {({ active }) => (
                                        <a
                                          href="#"
                                          className={classNames(
                                            active
                                              ? "bg-gray-100 text-gray-900"
                                              : "text-gray-700",
                                            "block px-4 py-2 text-sm"
                                          )}
                                        >
                                          {variables[k].name}
                                        </a>
                                      )}
                                    </Menu.Item>
                                  );
                                })}
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu> */}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="divide-y divide-gray-200 px-4 sm:px-6">
                      <div className="space-y-6 pt-6 pb-5">
                        <div>
                          <label
                            htmlFor="project-name"
                            className="block text-sm font-medium text-gray-900"
                          >
                            {" "}
                            3. Project name{" "}
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="project-name"
                              id="project-name"
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-900 ml-3"
                          >
                            {" "}
                            Description{" "}
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="description"
                              name="description"
                              rows={4}
                              className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              defaultValue={""}
                            />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            Team Members
                          </h3>
                          <div className="mt-2">
                            <div className="flex space-x-2">
                              {team.map((person) => (
                                <a
                                  key={person.email}
                                  href={person.href}
                                  className="rounded-full hover:opacity-75"
                                >
                                  <img
                                    className="inline-block h-8 w-8 rounded-full"
                                    src={person.imageUrl}
                                    alt={person.name}
                                  />
                                </a>
                              ))}
                              <button
                                type="button"
                                className=" inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              >
                                <span className="sr-only">Add team member</span>
                                {/* <PlusSmIcon
                                 className="h-5 w-5"
                                 aria-hidden="true"
                               /> */}
                              </button>
                            </div>
                          </div>
                        </div>
                        {/* <fieldset>
                          <legend className="text-sm font-medium text-gray-900">
                            Privacy
                          </legend>
                          <div className="mt-2 space-y-5">
                            <div className="relative flex items-start">
                              <div className="absolute flex h-5 items-center">
                                <input
                                  id="privacy-public"
                                  name="privacy"
                                  aria-describedby="privacy-public-description"
                                  type="radio"
                                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  defaultChecked
                                />
                              </div>
                              <div className="pl-7 text-sm">
                                <label
                                  htmlFor="privacy-public"
                                  className="font-medium text-gray-900"
                                >
                                  {" "}
                                  Public access{" "}
                                </label>
                                <p
                                  id="privacy-public-description"
                                  className="text-gray-500"
                                >
                                  Everyone with the link will see this project.
                                </p>
                              </div>
                            </div>
                            <div>
                              <div className="relative flex items-start">
                                <div className="absolute flex h-5 items-center">
                                  <input
                                    id="privacy-private-to-project"
                                    name="privacy"
                                    aria-describedby="privacy-private-to-project-description"
                                    type="radio"
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                </div>
                                <div className="pl-7 text-sm">
                                  <label
                                    htmlFor="privacy-private-to-project"
                                    className="font-medium text-gray-900"
                                  >
                                    {" "}
                                    Private to project members{" "}
                                  </label>
                                  <p
                                    id="privacy-private-to-project-description"
                                    className="text-gray-500"
                                  >
                                    Only members of this project would be able
                                    to access.
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="relative flex items-start">
                                <div className="absolute flex h-5 items-center">
                                  <input
                                    id="privacy-private"
                                    name="privacy"
                                    aria-describedby="privacy-private-to-project-description"
                                    type="radio"
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                </div>
                                <div className="pl-7 text-sm">
                                  <label
                                    htmlFor="privacy-private"
                                    className="font-medium text-gray-900"
                                  >
                                    {" "}
                                    Private to you{" "}
                                  </label>
                                  <p
                                    id="privacy-private-description"
                                    className="text-gray-500"
                                  >
                                    You are the only one able to access this
                                    project.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </fieldset> */}
                      </div>
                      <div className="pt-4 pb-6">
                        <div className="flex text-sm">
                          <a
                            href="#"
                            className="group inline-flex items-center font-medium text-indigo-600 hover:text-indigo-900"
                          >
                            {/* <LinkIcon
                             className="h-5 w-5 text-indigo-500 group-hover:text-indigo-900"
                             aria-hidden="true"
                           /> */}
                            <span className="ml-2"> Copy link </span>
                          </a>
                        </div>
                        <div className="mt-4 flex text-sm">
                          <a
                            href="#"
                            className="group inline-flex items-center text-gray-500 hover:text-gray-900"
                          >
                            {/* <QuestionMarkCircleIcon
                             className="h-5 w-5 text-gray-400 group-hover:text-gray-500"
                             aria-hidden="true"
                           /> */}
                            <span className="ml-2">
                              {" "}
                              Learn more about sharing{" "}
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-shrink-0 justify-end px-4 py-4">
                  <button
                    type="button"
                    className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="ml-4 inline-flex justify-center rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Create
                  </button>
                </div>
                <h1>{setProcess}</h1>
                <div className="w-full flex justify-end ">
                  <button
                    type="button"
                    onClick={startProcess}
                    className="mt-10 mb-5 ml-auto mr-auto px-5 py-2 border border-transparent text-base font-medium rounded-full shadow-sm text-white hover:bg-gray-700 bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Generate Data
                  </button>
                </div>
              </form>
            </div>
          </Transition.Child>
        </div>
      </div>
      {/* </Dialog> */}
    </Transition.Root>
  );
};

export default DataGenerator;
