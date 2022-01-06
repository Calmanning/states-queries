const townPopulationLayerUrl = "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Major_Cities/FeatureServer/0"

// NOTE: still need to get the city point locations to appear on the map
function getCitiesFromState(state){
    arcgisRest.queryFeatures(
        {
        url:townPopulationLayerUrl,
        where: `ST = '${state}'`,
        outFields: "NAME, POPULATION",
        returnGeometry: true
        }
    ).then(response => {
        getCityListHeadings(response)
    }).catch(err => {
        console.log(err)
    })
}
