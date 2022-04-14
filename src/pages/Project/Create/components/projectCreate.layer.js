import { LayerContainer } from "modules/avl-map/src";
import * as turf from "@turf/turf";
import flatten from "lodash.flatten";
// import DataGenerator from "./dataGenerator_single";
import DataGenerator from "./dataGenerator";
import CreateNewProject from "./createNewProject";
import Test from "./test";

class PopSynthLayer extends LayerContainer {
  filters = {};

  state = {
    selectedPumas: [],
    selectedBlockGroups: [],
    selectedPumasBgs: {},
  };

  sources = [
    {
      id: "pumas",
      source: {
        type: "vector",
        url: "https://tiles.availabs.org/data/census_puma10_ny_2019.json",
      },
    },
    {
      id: "bgs",
      source: {
        type: "vector",
        url: "https://tiles.availabs.org/data/census_block_groups_ny_2019.json",
      },
    },
  ];

  layers = [
    {
      id: "BG",
      "source-layer": "tl_2019_36_bg",
      source: "bgs",
      type: "fill",
      paint: {
        "fill-color": "blue",
        "fill-opacity": 0.2,
      },
    },
    {
      id: "BG-highlight",
      "source-layer": "tl_2019_36_bg",
      source: "bgs",
      type: "fill",
      paint: {
        "fill-color": "red",
        "fill-opacity": 0.3,
        "fill-outline-color": "red",
      },
      filter: ["in", "GEOID", ""],
    },

    {
      id: "PUMA",
      "source-layer": "tl_2019_36_puma10",
      source: "pumas",
      type: "fill",
      paint: {
        "fill-color": "white",
        "fill-opacity": 0.0,
      },
    },
    {
      id: "PUMA-show",
      "source-layer": "tl_2019_36_puma10",
      source: "pumas",
      type: "line",
      paint: {
        "line-color": "white",
        "line-width": 1,
      },
    },
    {
      id: "PUMA-highlight",
      "source-layer": "tl_2019_36_puma10",
      source: "pumas",
      type: "line",
      paint: {
        "line-color": "yellow",
        "line-width": 4,
      },
      filter: ["in", "GEOID10", ""],
    },
  ];

  infoBoxes = [
    {
      Component: DataGenerator,
      show: true,
    },
    {
      Component: CreateNewProject,
      show: false,
    },
    {
      Component: Test,
      show: false,
    },
  ];

  // onHover = {
  //   layers: ["BG"],
  //   callback: (layerId, features, lngLat) => {
  //     console.log("hover", layerId, features, lngLat);
  //     let { GEOID } = features[0].properties;
  //     return [[GEOID]];
  //   },
  // };
  // onHover = {
  //   layers: ["PUMA"],
  //   callback: (layerId, features, lngLat) => {
  //     console.log("hover", layerId, features, lngLat);
  //     let { PUMACE10 } = features[0].properties;
  //     return [[PUMACE10]];
  //   },
  // };

  onClick = {
    layers: ["PUMA"],
    callback: (layerId, features, lngLat) => {
      let { GEOID10, NAMELSAD10 } = features[0].properties;

      let selected = this.state.selectedPumas;

      if (!selected.includes(GEOID10)) {
        this.updateState({
          selectedPumas: [...selected, GEOID10],
        });
        console.log("add", selected);
      } else {
        let removed = selected.filter((item) => item !== GEOID10);
        this.updateState({
          selectedPumas: [...removed],
        });
        console.log("remove", selected);
      }

      //show selected PUMAs on map

      this.mapboxMap.setFilter("PUMA-highlight", [
        "in",
        "GEOID10",
        ...this.state.selectedPumas,
      ]);

      /* Code goes here */
      // 1. this.mapboxMap.queryRenderedFeatures
      // 2.create turf puma geometries
      // 3.create turf bg geometries
      // 4.boolean contains of bg in puma
      // 5.map list of contained bgs into array of bg geoids
      // 6.setFilter on bgHighlight

      //1. this.mapboxMap.queryRenderedFeatures /////////////////////////////////////////////
      var selectedFeaturesPuma = this.mapboxMap
        .queryRenderedFeatures({
          layers: ["PUMA"],
        })
        .filter((d) => this.state.selectedPumas.includes(d.properties.GEOID10));
      console.log("selectedFeaturesPuma", selectedFeaturesPuma);

      // 2.create turf puma geometries /////////////////////////////////////////////////////
      let selectedFeaturesGeoidsPuma = selectedFeaturesPuma.map(
        (d) => d.properties.GEOID10
      );

      let selectedFeaturesGeometryPuma = selectedFeaturesPuma.reduce(
        (acc, feature) => {
          acc[feature.properties.GEOID10] = feature;
          return acc;
        },
        {}
      );

      let selectedFeaturesGeometryPumaOnly = Object.values(
        selectedFeaturesGeometryPuma
      );

      var featuresBgs = this.mapboxMap.queryRenderedFeatures({
        layers: ["BG"],
      });

      console.log("featuresBgs", featuresBgs);

      let featuresGeometryBgs = featuresBgs.reduce((acc, feature) => {
        acc[feature.properties.GEOID] = feature;
        return acc;
      }, {});

      console.log("featuresGeometryBgs", featuresGeometryBgs);
      console.time("reduceOverlap");

      //reformat to get pumaID

      let PUMAandBgs = Object.values(selectedFeaturesPuma).reduce(
        (acc, feature) => {
          console.log("feature2", feature);

          let selectedBgIds = Object.keys(featuresGeometryBgs).reduce(
            (acc, geoid) => {
              // console.log('check bg', geoid, featuresGeometryBgs[geoid])
              // //let polygon = turf.polygon(featuresGeometryBgs[geoid])
              let results = turf.booleanPointInPolygon(
                turf.centroid(featuresGeometryBgs[geoid]),
                feature
              );

              if (results) {
                feature.properties.GEOID10 = acc.push(geoid);

                // let selectedBgsIds =[]
                // selectedBgsIds.push(geoid)
                // acc[feature.properties.GEOID10] = selectedBgsIds.push(geoid)
              }
              return acc;
            },
            []
          );

          acc[`${feature.properties.STATEFP10}${feature.properties.PUMACE10}`] =
            selectedBgIds;
          return acc;
        },
        {}
      );

      console.timeEnd("reduceOverlap");

      let newContainsBgs = Object.values(PUMAandBgs).map((p) => p);

      console.log("containsBgs", PUMAandBgs, flatten(newContainsBgs));

      this.updateState({
        selectedBlockGroups: flatten(newContainsBgs),
      });

      this.updateState({
        selectedPumasBgs: PUMAandBgs,
      });

      console.log("this.state.selectedPumasBgs", this.state.selectedPumasBgs);

      var uniqbg = new Set(this.state.selectedBlockGroups);

      this.mapboxMap.setFilter("BG-highlight", [
        "in",
        "GEOID",
        //...containsBgs,
        ...uniqbg,
      ]);

      function checkIfArrayIsUnique(myArray) {
        return myArray.length === new Set(myArray).size;
      }

      console.log(
        "is unique?",
        checkIfArrayIsUnique(this.state.selectedBlockGroups)
      );
    },
  };

  render(map) {}
}

const PopSynthLayerFactory = (options = {}) => new PopSynthLayer(options);

export default PopSynthLayerFactory;
