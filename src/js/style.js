var BORDER = 'rgba(0,0,255,0.5)';
var FILL = 'rgba(0,0,0,0)';
var SELECTION = 'rgba(0,0,255,0.3)';

var STYLE = {
	cache: {},
	getZoom: function(resolution){
		return nyc.ol.TILE_GRID.getZForResolution(resolution);
	},
	polygon: function(feature, zoom, border, fill){
		STYLE.cache[zoom] = STYLE.cache[zoom] || {};
		if (!STYLE.cache[zoom][fill]){
			var width = [1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 3][zoom];
			STYLE.cache[zoom][fill] = [new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: border,
					width: width
				}),
				fill: new ol.style.Fill({color: fill})
			})];
		}
		return STYLE.cache[zoom][fill];
	},
	layer: function(feature, resolution){
		return STYLE.polygon(feature, STYLE.getZoom(resolution), BORDER, FILL);
	},
	selection: function(feature, resolution){
		return STYLE.polygon(feature, STYLE.getZoom(resolution), BORDER, SELECTION);
	}
};
