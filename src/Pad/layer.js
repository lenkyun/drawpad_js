define([
	"./object",
], function( object, modes ){
	var layer = function(){
		// Section - Layer
		// Private static zone
		var layer, setting;

		setting = new object.Settings({
			index: 0,
			write: false,
			root: false,
			count: 0,
			pad: false,
			indexCount: 0
		});
		setting = setting.create( 0 );
		var ev = setting.event;
		var data = [];
		
		ev.add( "create" );
		ev.add( "remove" );
		ev.add( "removeAll" );
		ev.add( "indexChange" );
		ev.add( "changeLayerSetting" );
		ev.add( "clearLayer" );
		ev.add( "reset" );
		
		// Defining function - not a constructor
		layer = function( i ){
			if( typeof i === "undefined" ){
				i = pad.layer.getLayer();
			}
			if( typeof i.layer === "undefined" ){
				i = pad.layer.getLayer(i);
			}
			return i;
		};
		
		var pad = false;
		
		// Public static function and variable
		extend(layer, {
			on: function( name, func ){
				return ev.on( name, func );
			},
			regisPad: function( padObject ){
				if( pad === false ){
					pad = padObject;
				}
			},
			root: function( e ){
				if( setting.get( "root" ) === false && e !== undefined ){
					setting.set( "root", e );
				}else{
					return setting.get( "root" );
				}
				return this;
			},
			write: function( e ){
				if( setting.get( "write" ) === false && typeof e !== "undefined" ){
					setting.set( "write", e );
				}else{
					return setting.get( "write" );
				}
			},
			create: function(){
				layer = new object.Layer(
					setting.add( "indexCount", true ), 
					"drawpad", 
					pad.settings.get( "CANVAS_WIDTH" ), 
					pad.settings.get( "CANVAS_HEIGHT" )
				);
				setting.get( "root" ).append( layer.getDOM( "$" ) );
				
				modes.get( "CreateLayer" ).eventSave();
				data.push( layer );
				window.data = data;
				ev.run( "create", this, { layer: layer } );
			},
			remove: function( i ){
				var dat = data, index;
				if( isNaN( index ) ){
					while( ( index = dat.indexOf(i) ) !== -1 ){
						this.remove( index );
					}
				} else {
					if( typeof dat[ index ] !== "undefined" ){
						ev.run( "remove", this, { layer: layer } );
						dat[ index ].remove();
						dat.splice( index, 1 );
						
					}
				}
				return this;
			},
			removeAll: function(){
				$.each(data, function(i, o){
					ev.run( "remove", this, { layer: o } );
					o.getDOM( "$" ).remove();
				});
				data = [];
				this.resetCount();
				console.log("%c[drawpad.layer.removeAll] All layer was removed.", "font-weight: bold; color: darkorange");
				ev.run( "removeAll", this, {} );
			},
			index: function( i ){
				if( typeof i === "undefined" ){
					return this.getLayer();
				} else if ( !isNaN( i ) ) {
					if( i < 0 ){
						return false;
					}
					if( i === setting.get( "index" ) ){
						return true;
					}
					if( i > data.length ){
						return false;
					}
					
					this.write().order( i );
					setting.set( "index", i );
					console.log( "%c[drawpad.layer.index] Layer index changed to [%i].", "font-weight: bold; color: darkorange", i );	

					try{
						pad.setStyle( "layer", i );
					}catch(e){
						console.warn("[drawpad.layer.index] Error in style.layer.");
					}
					this.getLayer().changethis();
					ev.run( "changeIndex", this, { layer: this.getLayer() } );
				} else if( i.layer ) {
					var x;
					if( ( x = data.indexOf( i ) ) !== -1 ){
						this.index( x );
						ev.run( "changeIndex", this, { layer: this.getLayer() } );
					} else {
						return false;
					}
				}
				return true;
			},
			set: function( setting ){
				var o, l, old;
				l = this();
				o = this.defines.options;
				
				switch( setting.mode ){
					case o.opacity:
						old = l.opacity();
						l.opacity(setting.value);
					break;
					case o.name:
						old = l.name();
						l.name(setting.value);
					break;
				}
				
				var data = {
					mode: setting.mode,
					oldvalue: old,
					newvalue: setting.value,
				};
				pad.modes.get( "ChangeLayerSetting" ).eventSave( data );
				ev.run( "changeLayerSetting", this, data );
			},
			clear: function(){
				$.each( data, function(i, o){
					o.clear();
					ev.run( "clear", this, { layer: o } );
				});
			},
			defines: {
				options: {
					opacity: 0,
					name: 1,
					order: 2
				}
			},
			getLayer: function( i ){
				if ( typeof i === "undefined" ){
					return data[setting.get( "index" )];
				} else if ( i > data.length ){
					return false;
				} else{
					return data[i];
				}
			},
			list: function(){
				return data;
			},
			resetCount: function(){
				setting.set( "count", 0 );
				ev.run( "reset", this, {} );
			},
		});
		return layer;
	};
	
	layer = layer();
	/* End Section: Layer */
});