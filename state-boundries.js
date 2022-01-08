getAvailableStates()


require([
        "esri/config",
        "esri/Map",
        "esri/Graphic",
        "esri/views/MapView",
        "esri/layers/FeatureLayer"
], (esriConfig, Map, Graphic, MapView, FeatureLayer) => {

    esriConfig.apiKey = 'AAPK115d19ab66264ef1b7cdbdd54b6804f4whm-2t82h02UCQQ1zigAlbT-GPsbqzkH4Cd1xDjXtPoshgyibnsGBM4zg-eklxut'
    
    const flStateBoundaries = new FeatureLayer (
        {
            url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_States_Generalized/FeatureServer',
            outFields: ["*"]
        }
    );

    const flCityPopulations = new FeatureLayer (
         {
             url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Major_Cities/FeatureServer',
             outfields: ["*"],
             definitionExpression: "",
             visible: false
         }
         );
        
    const map = new Map (
        {
            basemap: "arcgis-topographic",
            layers: [
                    flStateBoundaries,
                    flCityPopulations 
            ]
        }
    );
    map.add(flStateBoundaries, 0)
    map.add(flCityPopulations, 1)
    
    const view = new MapView(
        {
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
        }
    );    
        
    
    //the visibleFieldNames here determine what is shown in the popup. Which is currently displayed on the layerView
    flStateBoundaries.load().
    then(() => {
        
        flStateBoundaries.popupTemplate = flStateBoundaries.createPopupTemplate({
            visibleFieldNames: new Set([
                "STATE_NAME", 
                "SUB_REGION", 
                "STATE_ABBR", 
                "POPULATION"
            ]),
        });
    });
    
    //this graphic get applied to the layerView
    const stateOutlineGraphic = new Graphic (
        {
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
        
    const addStatePopup = function highlight(queryResults) {
       
        view.graphics.add(stateOutlineGraphic);
        
        view.popup.open(
            {
                location: stateOutlineGraphic.geometry,
                features: queryResults.features,
                featureMenuOpen: true,
            }
        );
        
    };
    
    view.on("click", ({mapPoint}) => {
    
        statesRESTQuery({ mapPoint, state: null }, setState)
        
    });

    stateSelectDropdown.addEventListener("change", (event) => {
        
        updateRESTQuery(event.target.value, setState);

    });
    
    // This is the event hub. This is what changes 'state'. It should remain in this file.
    const setState = (state, stateQueryResult) => {
                
        if(stateQueryResult){
            addStatePopup(stateQueryResult)
        };

        renderCitiesToView(state)

        updateStateDropdownSelector(state);
        
        getCitiesFromState(state);

        queryStatesFeatureViewEditor(state, statesFeatureViewQuery)
            
    };
    
    let stateQueryResult = null;

    const statesFeatureViewQuery = (query, state) => {

        if(stateQueryResult && 
           stateQueryResult.features[0].attributes.STATE_ABBR === state) {
            return
        };

        flStateBoundaries.queryFeatures(query)
            .then((queryResults) => {
                stateQueryResult = queryResults;
                setState(stateQueryResult.features[0].attributes.STATE_ABBR, stateQueryResult)
        });
    };

    const renderCitiesToView = (state) => {
    
        flCityPopulations.definitionExpression = `ST = '${state}'`
        flCityPopulations.visible = true
            
    };

});