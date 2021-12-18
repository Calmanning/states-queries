
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
    
    //this is the start of the filtered city list-table. Now here's the question: is it being implemented well? Is there another way to set this up, to compartmentalize it?
    const filteredCitiesList = document.createElement("table")
    const cityListTableBody = document.createElement("tbody")

    const createFilterCitiesList = (cityQueryResults) => {
        filteredCitiesList.setAttribute("class", "table");
        filteredCitiesList.setAttribute("style", "font-family: 'Avenir-Next'; font-size: 1em;")
        //need to map over the query results to get the city names. 
        document.body.appendChild(filteredCitiesList)
        filteredCitiesList.appendChild(cityListTableBody)
        createCityListTableEntries(cityQueryResults)

    }

    //map over results here? or no?
    const createCityListTableEntries = (cityQueryResults)=>{
            cityList = cityQueryResults.features.map((cities) => {
             console.log(cities.attributes.NAME)
             return `<tr>${cities.attributes.NAME}</tr>`
        }).join("")
       cityListTableBody.innerHTML = cityList
       // should I call the table creation here?
        // createFilterCitiesList(cityEntries)
    }

        
    flCityPopulations.load().then(() => {
        view.extent = flCityPopulations.fullExtent;
    })
    
    flStateBoundaries.load().then(() => {
        flStateBoundaries.popupTemplate = flStateBoundaries.createPopupTemplate({
            visibleFieldNames: new Set(["STATE_NAME", "SUB_REGION", "STATE_ABBR", "POPULATION"]),
            title: "{STATE_NAME}"
        }
        );
    });
    
    //creating outline graphic of selected feature queried
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
    
    //instantiating a placeholder for the state selected in the dropdown
    //do I still need this placeholder?
    let stateSelected
    const setState = (state) => {
        stateSelected = state;
        console.log(state)
        updateStateDropdownSelector(state);  
        filterCitiesByState(state);
        updateQuery(state)
    }

    const filterCitiesByState = (state) => {
                console.log(state)
        const filteredCitiesWhereClause = `ST = '${state}'`      
        flCityPopulations.definitionExpression = filteredCitiesWhereClause;
        console.log(filteredCitiesWhereClause)
        queryCitiesEditor(filteredCitiesWhereClause);
    }

    const updateStateDropdownSelector = (state) => {
                console.log(state)

        stateSelectDropdown.innerHTML = [`<option>${state}</option>`, ...stateSelectChoices]
    }

    const updateQuery = (state) => {
         const stateQueryWhereClause = `STATE_ABBR = '${state}'`
         queryStatesEditor({stateQueryWhereClause});
    }
    
    const queryStatesEditor = ({mapPoint, stateQueryWhereClause}) => {
        console.log(stateQueryWhereClause)
        const queryTemplate = {
                returnGeometry: true,
                returnQueriedGeometry: true,
                outFields: ["*"]
        }
        
       let queryAdjustment = (stateQueryWhereClause) ? queryTemplate.where = stateQueryWhereClause : queryTemplate.geometry = mapPoint
       
       statesQuery(queryTemplate)
    };

    const queryCitiesEditor = (filteredCitiesWhereClause) => {
        console.log(filteredCitiesWhereClause)
        const queryTemplate = {
            where: filteredCitiesWhereClause,
            outFields: ["NAME"]
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
    
    //re: the mapPoint click-event: still debating on wheter or not I should include some addtional function call (setState) in this function. Or if there is a way to call it earlier.
    const statesQuery = (query) => {
        console.log(query);
        flStateBoundaries.queryFeatures(query)
        .then((queryResults) => {
            //This works, but I don't like it. It adds more complexicty where I don't really want it. And it could get complicated with any updates/changes.There has to be a better way.
            let stateAbbreviation = queryResults.features[0].attributes.STATE_ABBR
            updateStateDropdownSelector(stateAbbreviation);  
            filterCitiesByState(stateAbbreviation);
            addStateHighlight(queryResults)
        });
    }

    const queryFilteredCities = (queryTemplate) => {
        console.log(queryTemplate)
        flCityPopulations.queryFeatures(queryTemplate).
        then((queryResults) => {
            createFilterCitiesList(queryResults)
    })
}

});