
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
    map.add(flStateBoundaries, 0)
    map.add(flCityPopulations, 1)

    
    const viewBuilder =(viewToggle) => {
        if(viewToggle){
            view = new MapView({
                container: "viewDiv",
                map: map,
                center: [-112, 50], 
                zoom: 4, 
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
        }
    }
    
    let viewToggle = false
    viewBuilder(viewToggle)
    
    if(viewToggle) {
        view.on("click", ({ mapPoint }) => {
            queryStatesEditor({ mapPoint, stateSelected: null })
        })
    }
    //the visibleFieldNames here determine what is shown in the popup. Which is currently displayed on the layerView
    flStateBoundaries.load().then(() => {
        flStateBoundaries.popupTemplate = flStateBoundaries.createPopupTemplate({
            visibleFieldNames: new Set(["STATE_NAME", "SUB_REGION", "STATE_ABBR", "POPULATION"]),
        });
    });
    
    //this graphic get applied to the layerView
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
    

    const mapViewBtn = document.createElement("button");
    mapViewBtn.setAttribute("id", "mapViewBtn");
    mapViewBtn.innerHTML = (viewToggle) ? "MapView on" : "MapView off"
    document.getElementById("btnDiv").append(mapViewBtn);

    
    //in it's current state, almost everything the stateSelectDropdown could be it's own separate file-component.
    const stateList = ["AK","CA","CO", "CT", "DE", "ME", "MI", "MT", "NY", "NV","OH", "OR", "PA", "UT", "WA"]
    
    const stateSelectDropdown = document.createElement("select")
    stateSelectDropdown.setAttribute("id","stateSelector");
    document.getElementById("selectorDiv").append(stateSelectDropdown);
    
    const createStateDropdownList = (list) => {
        stateSelectChoices = list.map((entry) => {
            return `<option> ${entry} </option>`
        })
        stateSelectDropdown.innerHTML = stateSelectChoices
    }
    
    stateSelectDropdown.addEventListener("change", (event) => {
        setState(event.target.value)
    });
    
    createStateDropdownList(stateList)

    const createCityListHeadings = (cityQueryResults) => {
        let dataHeadings = Object.keys(cityQueryResults.features[0].attributes).map((headers) => {
            return `<span>${headers}</span>`
        }).join(" ")
        
        createCityListEntries(cityQueryResults, dataHeadings)
    }
    
    const cityListData = document.createElement("div")
          cityListData.setAttribute("id", "cityList")  

    const createCityListEntries = (cityQueryResults, dataHeadings)=>{
        let cityList = cityQueryResults.features.map((city) => {
            
            let town = city.attributes.NAME
            let population  = city.attributes.POPULATION

            return (
                `<p>${town}: ${population}</p>`)
            }).join("")
            
       document.getElementById("dataDiv").append(cityListData)
       cityListData.innerHTML = `<h3>${dataHeadings}</h3>${cityList}`
    }
    

        


    
    //this function, calling other functions would stay.
    const setState = (state) => {
        if(localStorage.length === 1 ) {
            updateStateDropdownSelector(state);  
            filterCitiesByState(state);
            localStorage.clear() 
        } else {
            updateQuery(state);
            filterCitiesByState(state); 
        }        
    }
    
    const updateStateDropdownSelector = (state) => {
        stateSelectDropdown.innerHTML = [`<option>${state}</option>`, ...stateSelectChoices]
    }
    
    const updateQuery = (state) => {
         const stateQueryWhereClause = `STATE_ABBR = '${state}'`
         queryStatesEditor({stateQueryWhereClause});
        }
        
    const queryStatesEditor = ({mapPoint, stateQueryWhereClause}) => {
        
        const queryTemplate = {
            returnGeometry: true,
            returnQueriedGeometry: true,
            outFields: ["*"]
        }
        
        let queryClauseAdjustment = (stateQueryWhereClause) ? queryTemplate.where = stateQueryWhereClause : queryTemplate.geometry = mapPoint
    
        statesQuery(queryTemplate)
    };
        
    const filterCitiesByState = (state) => {
        const filteredCitiesWhereClause = `ST = '${state}'`      
        flCityPopulations.definitionExpression = filteredCitiesWhereClause;        queryCitiesEditor(filteredCitiesWhereClause);
    }

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
    
    const statesQuery = (query) => {
        if(query.geometry){
                flStateBoundaries.queryFeatures(query)
            .then((queryResults) => {
                let stateAbbreviation = queryResults.features[0].attributes.STATE_ABBR
                localStorage.setItem('state', stateAbbreviation)
                setState(stateAbbreviation)
                addStateHighlight(queryResults)
            });
        } else {
                flStateBoundaries.queryFeatures(query)
            .then((queryResults) => {
                addStateHighlight(queryResults)
            });
        }
    }

    const queryFilteredCities = (queryTemplate) => {
        flCityPopulations.queryFeatures(queryTemplate).
    then((queryResults) => {
            createCityListHeadings(queryResults)
        });
    }

    




});