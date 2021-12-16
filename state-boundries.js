
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
        
        flCityPopulations = new FeatureLayer ({
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
    

    const stateList = ["AK","CA","CO", "CT", "DE", "ME", "MI", "MT", "NY","OH", "OR", "PA", "UT", "WA"]

    const stateSelectUI = document.createElement("select")
        stateSelectUI.setAttribute("class","esri-widget");
        stateSelectUI.setAttribute("style", "width: 200px; font-family: 'Avenir-Next'; fonst-size: 1em;")

    const stateSelectChoices = stateSelectUI.innerHTML = stateList.map((entry) => {
            return `<option> ${entry} </option>`
        })

    view.ui.add(stateSelectUI, "top-right");

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
    
    //event listener for when a state on the map is clicked 
    view.on("click", (event) => {
        pointQuery(event)
    })

    
    let stateSelected
    //eventlistener for the state selector. 
    stateSelectUI.addEventListener("change", (event) => {
        stateSelected = event.target.value
        selectQuery(stateSelected);
    });
    
     
    const pointQuery = function queryClickedFeatures(pointClickedEvent){
        const point = view.toMap(pointClickedEvent) 
        flStateBoundaries.queryFeatures({
            geometry: point,
            distance: null,
            units: null,
            spatialRelationship: "intersects",
            returnGeometry: false,
            returnQueryGeometry: true,
            outFields: ["*"]
        })
        .then((queryResults) => {
            console.log(queryResults)
            flCityPopulations.definitionExpression = `ST = '${queryResults.features[0].attributes.STATE_ABBR}'`
            stateSelectUI.innerHTML = [`<option>${queryResults.features[0].attributes.STATE_ABBR}</option>`, ...stateSelectChoices]
            addHighlight(queryResults)
        });
    }
    const selectQuery = function querySelectedFeatures(stateSelected){
        flCityPopulations.definitionExpression = `ST = '${stateSelected}'`
        flStateBoundaries.queryFeatures({
            where:  `STATE_ABBR = '${stateSelected}'`,
            spatialRelationship: "intersects",
            returnGeometry: false,
            returnQueryGeometry: true,
            outFields:["*"]
        }).then((queryResults) => {
           view.graphics.add(stateOutlineGraphic);
           addHighlight(queryResults)
        });
    }

    const addHighlight = function highlight(queryResults){
        view.graphics.add(stateOutlineGraphic);
        view.popup.open({
                location: stateOutlineGraphic.geometry,
                features: queryResults.features,
                featureMenuOpen: true,
        });
    }

});