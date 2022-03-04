require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/CSVLayer",
  "esri/layers/FeatureLayer",
  "esri/core/scheduling",
  "esri/widgets/Fullscreen",
  "esri/layers/support/LabelClass",
  "esri/config"
], function (
  Map,
  SceneView,
  CSVLayer,
  FeatureLayer,
  scheduling,
  Fullscreen,
  LabelClass,
  esriConfig
) {
  //
  esriConfig.apiKey =
    "AAPK551c88f8d25e4cb6a6fa84e30ea07c240tXPQnH9X28B5uBat8NrS16NXKresOv90auUds7afDCcdpnlA4rLVheETm_yQlL_";
  //
  const url =
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
  //
  const initialRenderer = {
    type: "simple",
    symbol: {
      type: "simple-marker",
      color: [0, 0, 0, 0],
      outline: {
        color: [0, 0, 0, 0],
        width: 1
      }
    }
  };
  //
  const objectSymbol = {
    type: "point-3d",
    symbolLayers: [
      {
        type: "object",
        // width: 70000 /*70000*/,
        // height: 100000,
        resource: {
          primitive: "cube" //cylinder
        },
        material: {
          color: "#e53935" //[113, 222, 110]
        }
      }
    ]
  };
  //
  const map = new Map({
    basemap: "arcgis-dark-gray", //arcgis-dark-gray arcgis-navigation-night arcgis-streets-night
    // layers: [worldCountries, worldCountriesExtruded],
    // ground: {
    //   opacity: 1,
    //   surfaceColor: "#3D4C57",
    // }    
  });
  //
  const view = new SceneView({
    container: "viewDiv",
    map: map,
    viewingMode: "global",
    camera: {
      position: {
        spatialReference: { latestWkid: 4326, wkid: 4326 },
        x: 190,
        y: 3.309571612356274,
        z: 20661501.503930703
      },
      heading: 15.36981324420197,
      tilt: 0.11792632041553405
    },
    environment: {
      starsEnabled: true,
      atmosphereEnabled: false,
      // background: {
      //   type: "color",
      //   color: "#3D4C57"
      // },
    },
    // highlightOptions: {
    //   haloColor: [255, 38, 150]
    //   // color: [255, 255, 255],
    //   // fillOpacity: 0.3
    // }
  });
  //
  let endDate = moment().subtract(2, "days").format("M/DD/YY");
  console.log("endDate", endDate);
  // document.querySelector("#viewDiv").classList.add("no-pointer");
  const displayDate = document.getElementById("displayDate");
  const myContainer = document.getElementById("myContainer");
  const progressBar = $("#progressBar");
  //
  const labelClass = new LabelClass({
    symbol: {
      type: "label-3d",
      symbolLayers: [
        {
          type: "text",
          material: {
            color: "white"
          },
          size: 10
          // halo: {
          //   color: "black",
          //   size: 2
          //  }
        }
      ]
    },
    labelPlacement: "above-center",
    labelExpressionInfo: {
      expression:
        "IIF(IsEmpty($feature['Province/State']), $feature['Country/Region'] + TextFormatting.NewLine, $feature['Province/State'] + TextFormatting.NewLine) + $feature[" +
        '"' +
        endDate +
        '"' +
        "]"
    }
  });
  //
  const fullscreen = new Fullscreen({
    view: view
  });
  //
  view.ui.add([
    { component: myContainer, position: "top-left" },
    { component: document.getElementById("logo"), position: "bottom-right" },
    { component: fullscreen, position: "top-right" }
  ]);
  view.ui.move(
    ["zoom", "compass", "navigation-toggle"],
    "top-right"
  );
  //
  const handle = scheduling.addFrameTask({
    update: function () {
      if (!view.interacting) {
        const camera = view.camera.clone();
        camera.position.longitude -= 0.5; //0.5
        view.camera = camera;
      } else {
        handle.remove();
      }
    }
  });
  //
  view.on("click", function() {
    handle.remove();
  });
  //
  function configProgressBar(nbDate) {
    progressBar.attr({ "data-total": nbDate });
  }
  //
  function animateProgressBar() {
    progressBar.progress("increment");
  }
  //
  function createLayer() {
    return new CSVLayer({
      url: url,
      renderer: initialRenderer,
      outFields: ["*"],
      title: "time_series_covid19_confirmed_global",
      id: "time_series_covid19_confirmed_global"      
    });
  }
  //
  function addLayer() {
    const layer = createLayer();
    view.map.add(layer);
    return layer;
  }
  //
  function createRenderer(defaultSym, dateCov, layer) {
    // EU 68569950
    // Bresil 23425392
    // Inde 38218773
    // Russie 10716397
    // RU 15506750
    // let w = 150000;    
    let visualRenderer = {
      type: "simple",
      symbol: defaultSym,
      visualVariables: [
        {
          type: "size",
          field: dateCov,
          stops: [
            {
              value: 0,
              size: 0
            },
            {
              value: 10000,
              size: 60000
            },
            {
              value: 1000000,
              size: 500000
            },
            {
              value: 2000000,
              size: 1000000
            },
            {
              value: 10000000,
              size: 3000000
            }
          ],
          axis: "height"
        },
        {
          type: "size",
          field: dateCov,
          axis: "width",
          //useSymbolValue: true // uses the width value defined in the symbol layer (50,000)
          stops: [
            {
              value: 0,
              size: 0
            },
            {
              value: 10000,
              size: 70000 //150000
            },
            {
              value: 1000000,
              size: 100000 //150000
            },
            {
              value: 2000000,
              size: 125000 //150000
            },
            {
              value: 10000000,
              size: 150000 //150000
            }
          ]
        }
      ]
    };
    layer.renderer = visualRenderer;
  }
  //
  function animate(layer) {
    setTimeout(function () {
      layer
        .queryFeatures()
        .then(function (results) {
          configProgressBar(
            Object.keys(results.features[0].attributes).length - 1
          );
          // console.log("results.features", results.features);
          // return results.features;
        })
        .then(function () {
          // const handle = scheduling.addFrameTask({
          //   update: function () {
          //     if (!view.interacting) {
          //       const camera = view.camera.clone();
          //       camera.position.longitude -= 0.5; //0.5
          //       view.camera = camera;
          //     } else {
          //       handle.remove();
          //     }
          //   }
          // });
          let currentIndex = 5; //5
          for (let i = 5; i < layer.fields.length; i++) {
            (function (ind) {
              setTimeout(function () {
                // console.log("currentIndex", currentIndex);
                // console.log("layer.fields.length", layer.fields.length);                
                if (currentIndex + 1 == layer.fields.length) {
                  // let highlightSelect;
                  // console.log("Loop completed !!!");
                  layer.labelingInfo = [labelClass];
                  // view.ui.add(
                  //   ["zoom", "compass", "navigation-toggle"],
                  //   "top-right"
                  // );
                  // handle.remove();
                  // document
                  //   .querySelector("#viewDiv")
                  //   .classList.remove("no-pointer");
                  // view
                  //   .whenLayerView(layer)
                  //   .then(function (layerView) {
                  //     console.log("layerView", layerView);
                  //     console.log("endDate", endDate);
                  //     console.log("layer", layer);
                  //     const myQuery = layer.createQuery();
                  //     //queryParams.where = queryParams.where + " AND TYPE = 'Extreme'";
                  //     // "POP04 > " + population;
                  //     // "STATE_NAME = 'Washington'";
                  //     //"mag > 5"
                  //     //let tutu = "9/99/99";
                  //     myQuery.where = "1=1"; // "'" + endDate + ' > 10000000' + "'"
                  //     //'1/22/22'
                  //     console.log("myQuery.where", myQuery.where);
                  //     layer.queryFeatures(myQuery).then((result) => {
                  //       // if a feature is already highlighted, then remove the highlight
                  //       if (highlightSelect) {
                  //         highlightSelect.remove();
                  //       }
                  //       console.log("result.features", result.features);
                  //       // the feature to be highlighted
                  //       //const feature = result.features[0];
                  //       //use the objectID to highlight the feature
                  //       result.features.forEach((feature) => {
                  //         highlightSelect = layerView.highlight(
                  //           feature.attributes["__OBJECTID"]
                  //         );
                  //       });
                  //     });
                  //   })
                  //   .catch(function (error) {
                  //     // An error occurred during the layerview creation
                  //   });
                }
                currentIndex++;
                myContainer.style.display = "inline-block";
                let dateCov = layer.fields[ind].alias;
                // console.log("dateCov", dateCov);
                let dateCovDisplay = moment.locale("fr");
                dateCovDisplay = moment(dateCov, "M/D/YY").format("LL");
                displayDate.textContent = "Cas de COVID19 au " + dateCovDisplay;
                animateProgressBar();
                createRenderer(objectSymbol, dateCov, layer);
              }, 100 * ind);
            })(i);
          }
        });
    }, 1000);
  }
  //
  view
    .when(function () {})
    .then(addLayer)
    .then(animate);
});
