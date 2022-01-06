//NOTE: experimenting with removing components from this file. certain components have been commented out for testing. 

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
        
    const map = new Map (
        {
            basemap: "arcgis-topographic",
            layers: [flStateBoundaries, 
            ]
        }
    );
    map.add(flStateBoundaries, 0)
    
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
        console.log(queryResults)
        view.popup.open(
            {
                location: stateOutlineGraphic.geometry,
                features: queryResults,
                featureMenuOpen: true,
            }
        );
        
    };
    
    view.on("click", ({ mapPoint }) => {
        queryStatesEditor({ mapPoint, stateSelected: null })
        console.log(queryStatesEditor({ mapPoint, stateSelected: null }))
    })

    stateSelectDropdown.addEventListener("change", (event) => {
        
    setState(event.target.value);
    });
    

    // This is the event hub. This is what changes 'state'. It should remain in this file.
    const setState = (state, stateQueryResult) => {

        if(stateQueryResult){
            
            addStatePopup(stateQueryResult)
        };

        if(stateQueryResult && 
         stateQueryResult.features[0].attributes.STATE_ABBR === state) {
         return
         }

        updateStateDropdownSelector(state);
        
        getCitiesFromState(state);
        
        updateQuery(state, updateStateQueryResult);
        
        
    };
    
    
    // const updateQuery = (state) => {
       
    //     const stateQueryWhereClause = `STATE_ABBR = '${state}'`
        
    //     queryStatesEditor({stateQueryWhereClause, state});
    // }
        
    // const queryStatesEditor = ({mapPoint, stateQueryWhereClause, state}) => {
        
    //     const queryTemplate = {
    //         returnGeometry: true,
    //         returnQueriedGeometry: true,
    //         outFields: ["*"]
    //     }
        
    //     let queryClauseAdjustment = (stateQueryWhereClause) 
    //         ? queryTemplate.where = stateQueryWhereClause 
    //         : queryTemplate.geometry = mapPoint
    
    //     statesQuery(queryTemplate, state)
    // };
    
    
    let stateQueryResult = null;
    function updateStateQueryResult(callbackResponse){
        stateQueryResult = callbackResponse
        console.log(stateQueryResult.features[0].attributes.STATE_ABBR)
        setState(stateQueryResult.features[0].attributes.STATE_ABBR, stateQueryResult)
    }


    // const statesQuery = (query, state) => {

    //     if(stateQueryResult && 
    //        stateQueryResult.features[0].attributes.STATE_ABBR === state) {
    //         return
    //     };

    //     flStateBoundaries.queryFeatures(query)
    //         .then((queryResults) => {
    //             stateQueryResult = queryResults;
    //             setState(stateQueryResult.features[0].attributes.STATE_ABBR, stateQueryResult)
    //         });
    //     };

});