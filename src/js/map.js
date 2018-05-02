var APP_ID = 'nyc-lib-example'
var APP_KEY = '74DF5DB1D7320A9A2'

var ID_FIELD = 'BoroCD';
var FEATURE_NAME = {
	/* implement for specific layer.json */
	getName: function(){
		var cd = this.get('BoroCD') + '';
		var boro = {
			'1': 'Manhattan',
			'2': 'Bronx',
			'3': 'Brooklyn',
			'4': 'Queens',
			'5': 'Staten Island'
		}[cd.substr(0, 1)]
		return boro + ' ' + cd.substr(1);
	}
}

var map, source, layer, selectionSource, show;

var qstr = document.location.search;
if (qstr){
	show = qstr.split('=')[1];
	var interval = setInterval(function(){
		if (source.getFeatures().length) {
			zoomTo(source.getFeatureById(show));
			clearInterval(interval);
		}
	}, 200);
};

function mapClicked(event){
	map.forEachFeatureAtPixel(event.pixel, function(feature, layer){
		var found = feature.get(ID_FIELD); /* replace id with unigue id from data in layer.json */
		if (found && window.parent && window.parent.mapClicked){
			window.parent.mapClicked(feature.getProperties());
		}
	});
};

function located(location){
	var coords = location.coordinates,
		feature = source.getFeaturesAtCoordinate(coords)[0];
	if (feature){
		zoomTo(feature);
	}
};

function zoomTo(feature){
	selectionSource.clear();
	var view = map.getView(),
		geom = feature.getGeometry();
	selectionSource.addFeature(feature);
	view.fit(geom.getExtent(), {size: map.getSize(), duration: 500});
	if (window.parent && window.parent.mapClicked){
		window.parent.mapClicked(feature.getProperties());
	}
};

$(document).ready(function(){

	map = new nyc.ol.Basemap({target: $('#map').get(0)});

	var geocoder = new nyc.Geoclient('https://maps.nyc.gov/geoclient/v1/search.json?app_key=' + APP_KEY + '&app_id=' + APP_ID);

	var locationMgr = new nyc.LocationMgr({
		controls: new nyc.ol.control.ZoomSearch(map),
		locate: new nyc.ol.Locate(geocoder),
		locator: new nyc.ol.Locator({map: map})
	});
	locationMgr.on(nyc.Locate.EventType.GEOCODE, located);

	source = new nyc.ol.source.Decorating(
		{url: 'layer.json', format: new ol.format.TopoJSON},
		[FEATURE_NAME, {extendFeature: function(){
				this.setId(this.get(ID_FIELD));
			}}]
	);
	layer = new ol.layer.Vector({source: source, style: STYLE.layer});
	map.addLayer(layer);

	selectionSource = new ol.source.Vector({});
	selectionLayer = new ol.layer.Vector({source: selectionSource, style: STYLE.selection});
	map.addLayer(selectionLayer);

	map.on('click', mapClicked);

	new nyc.ol.FeatureTip(map, [{
		layer: layer,
		labelFunction: function(){
			return {text: this.getName()};
		}
	}]);

});
