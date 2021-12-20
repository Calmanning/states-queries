
require([
        "esri/config",
        "esri/Map",
        "esri/Graphic",
        "esri/views/MapView",
        "esri/layers/FeatureLayer"
], (esriConfig, Map, Graphic, MapView, FeatureLayer) => {

    esriConfig.apiKey = "AAPK115d19ab66264ef1b7cdbdd54b6804f4whm-2t82h02UCQQ1zigAlbT-GPsbqzkH4Cd1xDjXtPoshgyibnsGBM4zg-eklxut"
    
    const flStateBoundaries = new FeatureLayer ({
        url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_States_Generalized/FeatureServer",
        outFields: ["*"]
        })
        
    const flCityPopulations = new FeatureLayer ({
             url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Major_Cities/FeatureServer",
                outfields: ["*"],
                definitionExpression: ""
        })

    const map = new Map ({
        basemap: "arcgis-topographic",
        layers: [flStateBoundaries, flCityPopulations]
    });

    
    const view = new MapView({
        container: "viewDiv",
        map: map,
        popup: {
            autoOpenEnabled: false,
            dockEnabled: true,
            dockOptions: {
                buttonEnabled: true,
                breakpoint: false,
                position: "bottom-right"
                }
            }
    });
    view.map.add(flCityPopulations, 1)
    view.map.add(flStateBoundaries, 0)
    

    const stateList = ["AK","CA","CO", "CT", "DE", "ME", "MI", "MT", "NY", "NV","OH", "OR", "PA", "UT", "WA"]

    const stateSelectDropdown = document.createElement("select")
        stateSelectDropdown.setAttribute("class","test");
        stateSelectDropdown.setAttribute("style", "position: absolute; top: 50px; right: 30px; width: 200px; font-family: 'Avenir-Next'; fonst-size: 1em;")
        document.body.appendChild(stateSelectDropdown);
    
    const createStateDropdownList = (list) => {
        stateSelectChoices = list.map((entry) => {
            return `<option> ${entry} </option>`
        })
        stateSelectDropdown.innerHTML = stateSelectChoices
    }
    createStateDropdownList(stateList)
    
    const filteredCitiesList = document.createElement("table")
        filteredCitiesList.setAttribute("class", "table");
        filteredCitiesList.setAttribute("style", "height:30vw; width: 50vw; margin: 0 auto; border: 3px solid black; font-family: 'Avenir-Next'; font-size: 1em;")
    const cityListTableBody = document.createElement("tbody")
        cityListTableBody.setAttribute("style", "height:300px; overflow-y:auto;")
    
    const createCityListTableHead = (cityQueryResults) => {
        let tableHeadings = Object.keys(cityQueryResults.features[0].attributes).map((headers) => {
            return `<td>${headers}</td>`
        }).join("")

        document.body.appendChild(filteredCitiesList)
        filteredCitiesList.appendChild(cityListTableBody)
        createCityListTableEntries(cityQueryResults, tableHeadings)
    }

    const createCityListTableEntries = (cityQueryResults, tableHeadings)=>{
        let cityList = Object.values(cityQueryResults.features).map((city) => {
            return (
                `<tr>
                <td>${Object.values(city.attributes)[0]}</td>
                <td>${Object.values(city.attributes)[1]}</td>
                </tr>`)
                }).join("")
        
       cityListTableBody.innerHTML = `<tr>${tableHeadings}</tr> ${cityList}`
    }
        
    flCityPopulations.load().then(() => {
        view.extent = flCityPopulations.fullExtent;
    })
    
    //the visibleFieldNames here determine what is shown in the popup.
    flStateBoundaries.load().then(() => {
        flStateBoundaries.popupTemplate = flStateBoundaries.createPopupTemplate({
            visibleFieldNames: new Set(["STATE_NAME", "SUB_REGION", "STATE_ABBR", "POPULATION"]),
        });
    });
    
    const stateOutlineGraphic = new Graphic ({
        symbol: {
            type: "simple-fill",
            color: [173, 216, 230, 0.2],
            outline: {
                color: [255, 255, 255],
                width: 1
            }
        }
    });
        
    //event listener for when a state on the map is clicked 
    view.on("click", ({ mapPoint }) => {
        queryStatesEditor({ mapPoint, stateSelected: null })
        console.log(mapPoint)

    })

    //eventlistener for the state selector. 
    stateSelectDropdown.addEventListener("change", (event) => {
        setState(event.target.value)
    });
    
    const setState = (state) => {
        updateStateDropdownSelector(state);  
        filterCitiesByState(state);
        updateQuery(state)
    }

    const updateStateDropdownSelector = (state) => {
        stateSelectDropdown.innerHTML = [`<option>${state}</option>`, ...stateSelectChoices]
    }
    
    const filterCitiesByState = (state) => {
        const filteredCitiesWhereClause = `ST = '${state}'`      
        flCityPopulations.definitionExpression = filteredCitiesWhereClause;        queryCitiesEditor(filteredCitiesWhereClause);
    }

    const updateQuery = (state) => {
         const stateQueryWhereClause = `STATE_ABBR = '${state}'`
         queryStatesEditor({stateQueryWhereClause});
    }
    
    const queryStatesEditor = ({mapPoint, stateQueryWhereClause}) => {
        console.log(mapPoint)
        const queryTemplate = {
                returnGeometry: true,
                returnQueriedGeometry: true,
                outFields: ["*"]
        }
        
       let queryClauseAdjustment = (stateQueryWhereClause) ? queryTemplate.where = stateQueryWhereClause : queryTemplate.geometry = mapPoint
       
       statesQuery(queryTemplate)
    };
    
    //the outFields listed here will effect the table display outcomes
    const queryCitiesEditor = (filteredCitiesWhereClause) => {
        const queryTemplate = {
            where: filteredCitiesWhereClause,
            outFields: ["NAME", "POPULATION"]
        }
        queryFilteredCities(queryTemplate)
    }
    
    const addStateHighlight = function highlight(queryResults){
        view.graphics.add(stateOutlineGraphic);
        view.popup.open({
                location: stateOutlineGraphic.geometry,
                features: queryResults.features,
                featureMenuOpen: true,
        });
    }
    //I end up repeating myself here. "updateStateDropdownSelector" and "filterCitiesByState" both exist in the setState function at line101
    const statesQuery = (query) => {
        flStateBoundaries.queryFeatures(query)
        .then((queryResults) => {
            let stateAbbreviation = queryResults.features[0].attributes.STATE_ABBR
            updateStateDropdownSelector(stateAbbreviation);  
            filterCitiesByState(stateAbbreviation);
            addStateHighlight(queryResults)
        });
    }

    const queryFilteredCities = (queryTemplate) => {
        flCityPopulations.queryFeatures(queryTemplate).
        then((queryResults) => {
            createCityListTableHead(queryResults)
    })
}

});