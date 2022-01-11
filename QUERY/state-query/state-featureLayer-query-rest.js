
const url = `https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_States_Generalized/FeatureServer/0/query`
    



const statesRESTQuery = ({ mapPoint, whereClause }, callback) => {   
    
        let params = {
            where: whereClause || '1=1',
            geometry: mapPoint ? mapPoint.toJSON() : null,
            geometryType: mapPoint ? 'esriGeometryPoint' : null,
            outFields: ['STATE_NAME', 'STATE_ABBR', 'FID'].join(','), 
            returnGeometry: true,
            f: 'json'
        }
        
        axios.get(url, {
            params 
        }).
        then((response) => {
            callback(response.data.features[0].attributes.STATE_ABBR)
        }).
        catch((err) => console.log(err))
        
}
    