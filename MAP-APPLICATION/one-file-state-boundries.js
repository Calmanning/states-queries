//Original version of the application. All aspects needed to run the application are located here.


console.log("conecting map")

require([
        "esri/config",
        "esri/Map",
        "esri/Graphic",
        "esri/views/MapView",
        "esri/geometry/Point",
        "esri/layers/FeatureLayer",
        "esri/core/watchUtils",
], (esriConfig, Map, Graphic, MapView, Point, FeatureLayer, watchUtils) => {

    esriConfig.apiKey = 'AAPK115d19ab66264ef1b7cdbdd54b6804f4whm-2t82h02UCQQ1zigAlbT-GPsbqzkH4Cd1xDjXtPoshgyibnsGBM4zg-eklxut'
    
// Establishing view and dependent Layers
    const flStateBoundaries = new FeatureLayer (
        {
            url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_States_Generalized/FeatureServer',
            outFields: ["*"],
        }
    );
    
    const popLimit = 100000

    const flCityPopulations = new FeatureLayer (
        {
            url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Major_Cities/FeatureServer',
            outfields: ["*"],
            definitionExpression: `POPULATION >= ${popLimit}`,
        }
        );

    const map = new Map (
        {
            basemap: "arcgis-topographic",
            layers: [flStateBoundaries, 
                     flCityPopulations,
            ]
        }
    );
    map.add(flStateBoundaries, 0)
    map.add(flCityPopulations, 1)

    
    const view = new MapView(
                {
                    container: "viewDiv",
                    map: map,
                    center: [-95, 40], 
                    zoom: 4,
                    popup: {
                        autoOpenEnabled: false,
                        dockEnabled: true,
                        dockOptions: {
                            buttonEnabled: true,
                            breakpoint: false,
                            position: "bottom-right",
                        },
                    } 
                }
    );

    const goto = (x, y) => {
      const point = new Point ({
        x: x,
        y: y,
        spatialReference: 3857
      });

      view.goTo({
        center: point,
        zoom:10,
      })
      .catch((error) => {
        console.log(error)
      })
    }
       
    flCityPopulations.load().
      then(() => {
        const scrim = document.getElementById("loading");
        scrim.style.visibility = "hidden"
        
    })
// UI components 
    const stateSelectDropdown = document.createElement("select")
    stateSelectDropdown.setAttribute("id","stateSelector");
    document.getElementById("selectorDiv").prepend(stateSelectDropdown);
    
    const populateStateDropdownList = (list) => {
        
        stateSelectChoices = list.map((entry) => {
            return `<option> ${ entry.attributes.STATE_ABBR } </option>`
        });
        
        stateSelectDropdown.innerHTML = stateSelectChoices.sort();
    };  

    const updateStateDropdownSelector = (state) => {
        stateSelectDropdown.innerHTML = [
                `<option>${ state }</option>`, 
                ...stateSelectChoices
            ]
    }

    // the following blocks populate data into a table 
    const getCityListHeadings = (cityQueryResults) => {
        
        let containerHeadings = Object.keys(cityQueryResults.features[0].attributes).map((headers) => {
            return `<th>${ headers }</th>`
        })
            .join(" ")
        
        getCityListEntries(cityQueryResults, containerHeadings,)
    };
    
    const cityListContainer = document.createElement("table")
    cityListContainer.setAttribute("id", "cityList")  

    const getCityListEntries = (cityQueryResults, containerHeadings,) => {
        let cityList = cityQueryResults.features.map((city) => {
            
            let st = city.attributes.ST

            let town = city.attributes.NAME
    
            let population  = city.attributes.POPULATION

            return (
                `<tr>
                    <td>${ town }</td> 
                    <td>${ st }</td> 
                    <td>${ population }</td>
                </tr>`
            )
        }).sort().join("");
        
       document.getElementById("table").append(cityListContainer);
       cityListContainer.innerHTML = `<thead><tr>${ containerHeadings }</tr></thead><tbody>${ cityList }</tbody>`
    };

    //collapsable function on the table
    const tableToggle = document.getElementById("collapsible");
    const tableView = document.getElementById("table-view");

    tableToggle.addEventListener("click", () => {
      if(tableView.style.display === "block") {
        tableView.style.display = "none";
      } else {
        tableView.style.display = "block";
      }
    })

    const card = document.createElement("calcite-card");
   
    const createCardInfo = (cityQueryResults,) => {
      const cityList = cityQueryResults.features.map((city) => {
            const st = city.attributes.ST

            const town = city.attributes.NAME
    
            const population  = city.attributes.POPULATION

            const location = city.geometry
            return (
                    `  
                    <div slot = "message">
                    <span>${ town }, ${st} </span> </br>
                    <span> Population: ${ population }</span> 
                    <div class = "butts" slot="footer-trailing">
                      <button class = 'btn goto' value = "${location.x}, ${location.y}">Go to city</button>
                    </div>
                    </div>
                    `
                  )
            }).sort().join("");

      document.getElementById("card-container").append(card);
       card.innerHTML = `
                          <span slot="title">${ cityQueryResults.features[0].attributes.ST }</span>
                          <span slot="subtitle">City Populations</span>
                          <calcite-block collapsible heading = "Cities" style = "max-height: 30vw; width: 30vw; overflow: auto;">
                            <calcite-notice active>
                              ${ cityList }  
                            </calcite-notice active>
                          </calcite-block>
                         ` 

                         addBlockButtonEventListener()
    }
    
    const stateOutlineGraphic = new Graphic ( {
      geometry: {
        type: "polygon",
            },
            symbol: {
              type: "simple-fill",
              color: [0, 160, 255, 0.4],
              outline: {
                  color: [0, 97, 155],
                  width: 2
              }
            }
        }
    );
    
    const addStateHighlight = (queryResults) => {
      
      stateOutlineGraphic.geometry.rings = null;

      stateOutlineGraphic.geometry.rings = queryResults.features[0].geometry.rings;

      view.graphics.add(stateOutlineGraphic);
        
    };

    const removeStateHighlight = () => {
        view.popup.close()
    };
    
// Event listeners
  
    view.on('mouse-wheel', (event) => {
      event.stopPropagation();
    });

    view.on("click", ({ mapPoint }) => {
            queryStatesEditor({ mapPoint, stateSelected: null, })
    });
    
    watchUtils.whenTrue(view, "stationary", () => {
        if(view.extent) {
            const queryTemplate = {
                where: `POPULATION > ${popLimit}`,
                geometry: view.extent,
                returnGeometry: true,
                returnQueriedGeometry: true,
                outFields: [
                    "NAME",
                    "ST",
                    "POPULATION",
                ],
            };
            
            // removeStateHighlight()

            queryCitiesByViewExtent(queryTemplate); 
        };
    });
    
    stateSelectDropdown.addEventListener("change", (event) => {
      setState(event.target.value);
    });

    const addBlockButtonEventListener = () => {
      document.querySelectorAll(".goto").forEach(button => {           
        button.addEventListener("click", (event) => {
        const location = event.target.value.split(",");
        goto(location[0], location[1]);
        });
      });
    };

    // State management    
    //this function is the hub for updating state and initiating queries.
    const setState = (state) => {

        if (stateQueryResult){
            addStateHighlight(stateQueryResult)
        };

        updateStateDropdownSelector(state);

        filterRenderedCitites(state);
        
        updateQuery(state);
    };
    
// Query constructors
    const updateQuery = (state) => {
       
        const stateQueryWhereClause = `STATE_ABBR = '${ state }'`
        
        queryStatesEditor({ stateQueryWhereClause, state, });
    }
        
    const queryStatesEditor = ({ mapPoint, stateQueryWhereClause, state, }) => {
        
        const queryTemplate = {
            where: stateQueryWhereClause || '1=1',
            geometry: mapPoint ? mapPoint : null,
            returnGeometry: true,
            returnQueriedGeometry: true,
            outFields: ["*"],
        }
        
        statesQuery(queryTemplate, state,)
    };
        
    const filterRenderedCitites = (state) => {
        const filteredCitiesWhereClause = `ST = '${ state }' AND POPULATION >= ${ popLimit }`;   

        queryFilteredCities(filteredCitiesWhereClause);
        
    };
        
// global indicator/placeholder to determine if statesQeury() has already been run.
    let stateQueryResult = null;

// Query operations on the feature layers
    const statesQuery = (query, state,) => {

        if(stateQueryResult && 
           stateQueryResult.features[0].attributes.STATE_ABBR === state) {
            return
        };

        flStateBoundaries.queryFeatures(query)
            .then((queryResults) => {
                stateQueryResult = queryResults;
                setState(stateQueryResult.features[0].attributes.STATE_ABBR)
          
            });
        };
    
    //Using REST query to keep city data results independent of the view.
    //the outFields listed here will effect the table display outcomes.
    const queryFilteredCities = (filteredCitiesWhereClause) => {

        const citiesFlURL = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Major_Cities/FeatureServer/0/query'

        const params = {
            where: `${ filteredCitiesWhereClause }`,
            outFields: ['NAME', 'ST', 'POPULATION',].join(','),
            f: 'json'
        }

        axios.get(citiesFlURL, {
            params
        })
            .then((response) => {
                getCityListHeadings(response.data)
                createCardInfo(response.data)
        });
    };

    const queryCitiesByViewExtent = (queryTemplate) => {        
        flCityPopulations.queryFeatures(queryTemplate)
            .then((queryResults) => {
                getCityListHeadings(queryResults)
        });
    };

    //REST query to keep state information independent from the view.
    //results from this query populate the state selector UI. 
    const queryAvailableStates = (() =>{
        
        const statesLayerUrl = "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_States_Generalized/FeatureServer/0/query"

        const params = {
            where: 'FID > 0',
            outFields: 'STATE_ABBR',
            returnGeometry: true,
            f: 'json',
        }

        axios.get(statesLayerUrl, { 
            params 
        })
            .then((response) => {
                populateStateDropdownList(response.data.features)
            })
            .catch((err) => console.log(err))
    });

    queryAvailableStates();

});
