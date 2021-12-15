
require([
        "esri/config",
        "esri/Map",
        "esri/Graphic",
        "esri/views/MapView",
        "esri/layers/FeatureLayer"
], (esriConfig, Map, Graphic, MapView, FeatureLayer) => {

    esriConfig.apiKey = "AAPK115d19ab66264ef1b7cdbdd54b6804f4whm-2t82h02UCQQ1zigAlbT-GPsbqzkH4Cd1xDjXtPoshgyibnsGBM4zg-eklxut"
    
    const featureLayer = new FeatureLayer ({
        url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_States_Generalized/FeatureServer",
        outFields: ["*"],
        
        })

    const map = new Map ({
        basemap: "arcgis-topographic",
        layers: [featureLayer]
        
    })
    
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
    view.map.add(featureLayer,0)

    const stateList = ["AK","CA","CO", "CT", "DE", "ME", "MI", "MT", "NY","OH", "OR", "PA", "UT", "WA"]

    const stateSelectUI = document.createElement("select")
        stateSelectUI.setAttribute("class","esri-widget");
        stateSelectUI.setAttribute("style", "width: 200px; font-family: 'Avenir-Next'; fonst-size: 1em;")

    const stateSelectChoices = stateSelectUI.innerHTML = stateList.map((entry) => {
            return `<option> STATE_ABBR = '${entry}'</option>`
        })

    view.ui.add(stateSelectUI, "top-right");

    //establishing point-marker-graphic
    const pointSelectedGraphic = new Graphic({
        symbol: {
            type: "simple-marker",
            color: [150,0,139],
            outline: {
                color: [255, 255, 255],
                width: 1.5
            }
        }
    });
    //creating outline graphic of selected feature queried
    const selectedOutlineGraphic = new Graphic ({
        symbol: {
            type: "simple-fill",
            color: [173, 216, 230, 0.2],
            outline: {
                color: [255, 255, 255],
                width: 1
            }
        }
    });

    featureLayer.load().then(() => {
        view.extent = featureLayer.fullExtent;
        featureLayer.popupTemplate = featureLayer.createPopupTemplate({
                visibleFieldNames: new Set(["STATE_NAME", "SUB_REGION", "STATE_ABBR", "POPULATION"]),
                title: "{STATE_NAME}"
            }
        );
        //look into the popupTemplate & createPopupTemplate function
    });

    view.on("click", (event) => {
        view.graphics.remove(pointSelectedGraphic);
        if (view.graphics.includes(selectedOutlineGraphic)){
            view.graphics.remove(selectedOutlineGraphic);
        }
        queryFeature(event)
    })

    let stateSelected

    //eventlistener for the state selector. Currently it calls the same queryt as the onClick event does. I think I'll need to build a new query for this selector.
    stateSelectUI.addEventListener("change", (event) => {
        stateSelected = event.target.value
        view.graphics.remove(pointSelectedGraphic);
        if (view.graphics.includes(selectedOutlineGraphic)){
            view.graphics.remove(selectedOutlineGraphic);
        }
        selectQuery(stateSelected);
    });
    
     
    const queryFeature = function queryFeatures(pointClickedEvent){
        const point = view.toMap(pointClickedEvent) 
        featureLayer.queryFeatures({
            //  -- Tried using this to include the stateSelector options. It doesn't work. Get an error -- 'unable to preform query. Check your parameters'
            geometry: point,
            distance: null,
            units: null,
            spatialRelationship: "intersects",
            returnGeometry: false,
            returnQueryGeometry: true,
            outFields: ["*"]
        })
        .then((queryResults) => {
            console.log()
            stateSelectUI.innerHTML = [`<option>  STATE_ABBR = '${queryResults.features[0].attributes.STATE_ABBR}' </option>`, ...stateSelectChoices]
            pointSelectedGraphic.geometry = point;
            view.graphics.add(pointSelectedGraphic)
            view.popup.open({
                location: point,
                features: queryResults.features,
                featureMenuOpen: true,
            })
            // if (queryResults.queryGeometry){
            //     selectedOutlineGraphic.geometry = queryResults.queryGeometry;
            //     view.graphics.add(selectedOutlineGraphic);
            // }
        });
    }

    const selectQuery = function query(stateSelected){
        featureLayer.queryFeatures({
            where: stateSelected,
            spatialRelationship: "intersects",
            returnGeometry: true,
            returnQueryGeometry: true,
            outFields:["*"]
        }).then((queryResults) => {
            view.graphics.add(selectedOutlineGraphic);
            view.popup.open({
                location: selectedOutlineGraphic.geometry,
                features: queryResults.features,
                featureMenuOpen: true,
            })
            // if (queryResults.queryGeometry){
            //     selectedOutlineGraphic.geometry = queryResults.queryGeometry;
            //     view.graphics.add(selectedOutlineGraphic);
            // }
        });
    }

})