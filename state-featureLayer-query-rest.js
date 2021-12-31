const stateBoudariesLayerUrl= "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_States_Generalized/FeatureServer/0"

arcgisRest.queryFeatures(
    {
        url: stateBoudariesLayerUrl,
        where: "FID > 0",
        outFields: "STATE_NAME, STATE_ABBR"
    }
).
then(response => {
        populateStateDropdownList(response.features)
})
