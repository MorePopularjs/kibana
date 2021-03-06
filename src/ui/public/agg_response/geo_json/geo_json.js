import _ from 'lodash';
import rowsToFeatures from 'ui/agg_response/geo_json/rows_to_features';
import AggResponseGeoJsonTooltipFormatterProvider from 'ui/agg_response/geo_json/_tooltip_formatter';
export default function TileMapConverterFn(Private) {

  const tooltipFormatter = Private(AggResponseGeoJsonTooltipFormatterProvider);

  return function (vis, table) {

    function columnIndex(schema) {
      return _.findIndex(table.columns, function (col) {
        return col.aggConfig.schema.name === schema;
      });
    }

    const geoI = columnIndex('segment');
    const metricI = columnIndex('metric');
    const geoAgg = _.get(table.columns, [geoI, 'aggConfig']);
    const metricAgg = _.get(table.columns, [metricI, 'aggConfig']);

    const features = rowsToFeatures(table, geoI, metricI);
    const values = features.map(function (feature) {
      return feature.properties.value;
    });

    return {
      title: table.title(),
      valueFormatter: metricAgg && metricAgg.fieldFormatter(),
      tooltipFormatter: tooltipFormatter,
      geohashGridAgg: geoAgg,
      geoJson: {
        type: 'FeatureCollection',
        features: features,
        properties: {
          min: _.min(values),
          max: _.max(values),
          zoom: geoAgg && geoAgg.vis.uiStateVal('mapZoom'),
          center: geoAgg && geoAgg.vis.uiStateVal('mapCenter')
        }
      }
    };
  };
}
