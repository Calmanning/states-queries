//Original version of the application. All aspects needed to run the application are located here.
// left document here for reference. Currently serves no purpose.

require([
        "esri/config",
        "esri/Map",
        "esri/Graphic",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/core/watchUtils",
], (esriConfig, Map, Graphic, MapView, FeatureLayer, watchUtils) => {

    esriConfig.apiKey = 'AAPK115d19ab66264ef1b7cdbdd54b6804f4whm-2t82h02UCQQ1zigAlbT-GPsbqzkH4Cd1xDjXtPoshgyibnsGBM4zg-eklxut'
    
    const flStateBoundaries = new FeatureLayer (
        {
            url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_States_Generalized/FeatureServer',
            outFields: ["*"],
        }
    );
        
     const flCityPopulations = new FeatureLayer (
         {
             url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Major_Cities/FeatureServer',
             outfields: ["*"],
             definitionExpression: "POPULATION >= 100000",
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
       
// UI components 
    const stateSelectDropdown = document.createElement("select")
    stateSelectDropdown.setAttribute("id","stateSelector");
    document.getElementById("selectorDiv").append(stateSelectDropdown);
    
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
    
// Event listeners
    view.on("click", ({ mapPoint }) => {
            queryStatesEditor({ mapPoint, stateSelected: null, })
    });
    
    watchUtils.whenTrue(view, "stationary", () => {
        if(view.extent) {
            const queryTemplate = {
                where: 'POPULATION > 100000',
                geometry: view.extent,
                returnGeometry: true,
                returnQueriedGeometry: true,
                outFields: [
                    "NAME",
                    "ST",
                    "POPULATION",
                ],
            }
            
            removeStateHighlight()

            queryCitiesByViewExtent(queryTemplate) 
        }
    })
    
    stateSelectDropdown.addEventListener("change", (event) => {
        
        setState(event.target.value);
    });

    
    
// State management    
    //this function is the hub for updating state.
    const setState = (state) => {

        if (stateQueryResult){
            addStateHighlight(stateQueryResult)
        };

        updateStateDropdownSelector(state);

        filterCitiesByState(state);
        
        updateQuery(state);
    };
    
// Query constructors
    const updateQuery = (state) => {
       
        const stateQueryWhereClause = `STATE_ABBR = '${ state }'`
        
        queryStatesEditor({ stateQueryWhereClause, state, });
    }
        
    const queryStatesEditor = ({ mapPoint, stateQueryWhereClause, state, }) => {
        
        const queryTemplate = {
            returnGeometry: true,
            returnQueriedGeometry: true,
            outFields: ["*"],
        }
        
        let queryClauseAdjustment = (stateQueryWhereClause) 
            ? queryTemplate.where = stateQueryWhereClause 
            : queryTemplate.geometry = mapPoint
    
        statesQuery(queryTemplate, state,)
    };
        
    const filterCitiesByState = (state) => {
        const filteredCitiesWhereClause = `ST = '${ state }' AND POPULATION >= 100000`;   
        
        queryCitiesEditor(filteredCitiesWhereClause);
    };

    //the outFields listed here will effect the table display outcomes
    const queryCitiesEditor = (filteredCitiesWhereClause) => {
        
        const queryTemplate = {
            where: `${ filteredCitiesWhereClause }`,
            outFields: [
                "NAME",
                "ST",
                "POPULATION"
            ]
        }
        
        queryFilteredCities(queryTemplate)
    };
    
//View-dependent UI elements
     
    //the visibleFieldNames here determine what is shown in the popup. Which is currently displayed on the layerView
    flStateBoundaries.load()
    .then(() => {
            flStateBoundaries.popupTemplate = flStateBoundaries.createPopupTemplate( {
                visibleFieldNames: new Set( [
                                            "STATE_NAME", 
                                            "SUB_REGION", 
                                            "STATE_ABBR", 
                                            "POPULATION"
                ]),
            });
        });
    
    const stateOutlineGraphic = new Graphic ( {
            symbol: {
                type: "simple-fill",
                color: [173, 216, 230, 0.2],
                outline: {
                    color: [255, 255, 255],
                    width: 1
                }
            }
        }
    );
    
    const addStateHighlight = (queryResults) => {
        
        view.graphics.add(stateOutlineGraphic);
        
        view.popup.open(
            {
                location: stateOutlineGraphic.geometry,
                features: queryResults.features,
                featureMenuOpen: true,
            }
        );

    };

    const removeStateHighlight = () => {
        console.log(stateOutlineGraphic)

        view.popup.close()
    }
    
// global control indicator used to determine if statesQeury() has already been run.
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
    
        const queryFilteredCities = (queryTemplate) => {
        console.log(queryTemplate)
        flCityPopulations.queryFeatures(queryTemplate)
            .then((queryResults) => {
                getCityListHeadings(queryResults)
        });
    };

    const queryCitiesByViewExtent = (queryTemplate) => {        
        console.log(queryTemplate)
        flCityPopulations.queryFeatures(queryTemplate)
            .then((queryResults) => {
                console.log(queryResults)
                getCityListHeadings(queryResults)
        });
    };

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

                console.log(response.data.features)
                populateStateDropdownList(response.data.features)
            })
            .catch((err) => console.log(err))
    });

    queryAvailableStates();

});
