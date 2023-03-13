var spae = {};
	spae.settings = {
		play: true,
		version: 2.01,
	};
	spae.info = {
		name: 'Sprite Animation Engine (spea)',
		version: '2.01.02',
		authors: ['drburnett'],
		dates: ['2020/06/16 - 2.01.02',],
		print: function(){console.log("Name:\t\t"+this.name + "\nVersion:\t"+this.version + "\nDate(s):\t"+this.dates.join("\n\t\t\t") + "\nAuthor(s):\t"+this.authors.join("\n\t\t\t") + "\n");}
	},
	spae.fps = {
		fps: 0,
		counter: 0,
		tick: function(){
			spae.fps.counter = spae.fps.counter + 1;
		},
		interval: setInterval(function(){
			spae.fps.fps = spae.fps.counter;
			spae.fps.counter = 0;
		}, 1000),
	};
	
	spae.play = function(){this.settings.play = true};
	spae.pause = function(){this.settings.play = false};

	spae.fonts = {};
	spae.createFont = function(font_id, options){
		var f = spae.fonts[font_id] = {};
			f.settings = {
				width: options.width,
				height: options.height,
			};
			f.srcmap = options.srcmap;
			f.img = new Image();
			f.img.src = options.src;
			if(options.case){
				if(options.case === 'lowercase'){
					f.onRender = function(str){return str.toLowerCase()}
				}else if(options.case === 'uppercase'){
					f.onRender = function(str){return str.toUpperCase()}
				}else if(options.case === 'capitalize'){
					f.onRender = function(str){return str.split(' ').map((v)=>{return v.charAt(0).toUpperCase() + v.slice(1)}).join(' ')}
				}
			}
	};
	
	
	
	spae.canvases = {};
	spae.createCanvas = function(canvas_id, options){
		var e = document.getElementById(canvas_id);

		if(e){
			let o = {
				width: options.width || window.innerWidth,
				height: options.height || window.innerHeight,
				bg: options.bg || false,
			};
			let c = this.canvases[canvas_id] = {};
				c.canvas = e;
				c.canvas.width = o.width;
				c.canvas.style.width = o.width + 'px';
				c.canvas.height = o.height;
				c.canvas.style.height = o.height + 'px';
				if(o.bg){
					c.canvas.style.backgroundColor = o.bg;
				}
				c.canvas.addEventListener('mousemove', function(e){
					let x = e.offsetX / Number(spae.canvases[this.id].settings.scale);
					let y = e.offsetY / Number(spae.canvases[this.id].settings.scale);
					spae.canvases[this.id].actions.hoveredPosition = {x: x, y: y}
				});
				c.canvas.addEventListener('contextmenu', function(e){e.preventDefault()});
				c.canvas.addEventListener('mousedown', function(e){
					let c = spae.canvases[this.id];
					if(c.actions.hoveredSprite){
						let x = e.offsetX / Number(spae.canvases[this.id].settings.scale);
						let y = e.offsetY / Number(spae.canvases[this.id].settings.scale);
						c.actions.focusedPosition = {x: x, y: y}
						c.actions.focusedSprite = c.actions.hoveredSprite;
					}
				});
				c.canvas.addEventListener('mouseup', function(e){
					let c = spae.canvases[this.id];
					let s = c.sprites[c.actions.focusedSprite];
					if(s){
						if(e.button === 2 && s.onRightClick){
							s.onRightClick(c, s, c.actions.hoveredPosition);
						}else if(e.button === 0){
							var dragged = false;
							if(s.onDrag){
								let x = c.actions.hoveredPosition.x - c.actions.focusedPosition.x;
								let y = c.actions.hoveredPosition.y - c.actions.focusedPosition.y;
								if(x > 3 || x < -3 || y > 3 || y < -3){
									let x = e.offsetX / Number(spae.canvases[this.id].settings.scale);
									let y = e.offsetY / Number(spae.canvases[this.id].settings.scale);
									let p = false;
										if(s.parent){
											p = spae.queryParent(c.canvas_id, s.parent);
										}
									if(p){										
										let o = Object.assign({}, p.parameters);
											o = spae.calc.anchor(c, p, o);
											o = spae.calc.parent(c, p, o);
											o = spae.calc.offset(c, p, o);
											o = spae.calc.state(c, p, o);
										let pfx = c.actions.focusedPosition.x - o.dx;
										let pfy = c.actions.focusedPosition.y - o.dy;
										let ptx = x - o.dx;
										let pty = y - o.dy;
										s.onDrag(c, s, c.actions.focusedPosition, {x: x, y: y}, {x: pfx, y: pfy}, {x: ptx, y: pty});
									}else{
										s.onDrag(c, s, c.actions.focusedPosition, {x: x, y: y}, false, false);
									}
									dragged = true;
								}
							}
							if(s.onClick && dragged === false){
								s.onClick(c, s, c.actions.focusedPosition);
							}
						}
					}
				});
				c.settings = {play: true, autoClear: true, autoRender: true, anchor: false, scale: 1};
					if(options.settings){
						if(options.settings.clearCanvas === false){c.settings.clearCanvas = false}
						if(options.settings.autoRender === false){c.settings.autoRender = false}
						if(options.settings.anchor){c.settings.anchor = options.settings.anchor}
						c.settings.scale = options.settings.scale || 1;
					}
				c.custom = options.custom || '';
				c.context = c.canvas.getContext("2d", {alpha: true});
				c.context.webkitImageSmoothingEnabled = false;
				c.context.mozImageSmoothingEnabled = false;
				c.context.imageSmoothingEnabled = false;
				c.context.scale(c.settings.scale, c.settings.scale);
				c.sprites = {};
				c.actions = {
					hoveredSprite: '',
					hoveredPosition: {x: 0, y: 0,},
					focusedSprite: '',
					focusedPosition: {x: 0, y: 0,},
				};
				c.onSprite = options.onSprite || '';
				c.onRender = options.onRender || '';
				c.canvas_id = canvas_id;
		}else{
			console.log('spae.createCanvas() - Unknown: Canvas_id');
		}
	};
	spae.createSprite = function(canvas_id, sprite_id, options){
		let c = spae.canvases[canvas_id];
		if(c){
			let s = c.sprites[sprite_id] = {};
				s.sprite_id = sprite_id;
				s.img = new Image();
				s.img.src = options.src || '';
				s.hidden = false;
				s.parameters = options.parameters || {sx: 0, sy: 0, sw: 32, sh: 32, dx: 0, dy: 0, dw: 32, dh: 32, ox: 0, oy: 0};
					s.parameters.ox = s.parameters.ox || 0;
					s.parameters.oy = s.parameters.oy || 0;
				if(s.parameters.dw){}else{s.parameters.dw = s.parameters.sw}
				if(s.parameters.dh){}else{s.parameters.dh = s.parameters.sh}
					
				s.anchor = options.anchor || false;
				s.parent = options.parent || false;
				s.state = options.state || '';
				s.stateFrame = 0;
				s.stateInterval = options.stateInterval || false;
				s.stateCounter = 0;
				s.states = options.states || {};
				s.collision = options.collision || false;
				s.custom = options.custom || '';
				s.onMouseOver = options.onMouseOver || '';
				s.onMouseOff = options.onMouseOff || '';
				s.onClick = options.onClick || '';
				s.onDrag = options.onDrag || '';
				s.onRightClick = options.onRightClick || '';
				s.onRender = options.onRender || '';
		}else{
			console.log('spae.createSprite() - Unknown: Canvas_id');
		}
	};
	spae.createText = function(canvas_id, sprite_id, options){
		let c = spae.canvases[canvas_id];
		if(c){
			let s = c.sprites[sprite_id] = {};
				s.sprite_id = sprite_id;
				s.hidden = false;
				s.parameters = options.parameters || {dx: 0, dy: 0, dw: 32, dh: 32, ox: 0, oy: 0};
					s.parameters.ox = s.parameters.ox || 0;
					s.parameters.oy = s.parameters.oy || 0;
				s.text = {
					text: options.text.text,
					font: options.text.font,
					color: options.text.color,
				};
				s.anchor = options.arnchor || false;
				s.parent = options.parent || false;
				s.custom = options.custom || '';
		}else{
			console.log('spae.createSprite() - Unknown: Canvas_id');
		}
	};
	spae.createWord = function(canvas_id, sprite_id, font_id, options){
		let c = spae.canvases[canvas_id];
		if(c){
			let s = c.sprites[sprite_id] = {};
				s.sprite_id = sprite_id;
				s.font_id = font_id;
				s.hidden = false;
				s.parameters = options.parameters || {dx: 0, dy: 0, dw: 32, dh: 32, ox: 0, oy: 0};
					s.parameters.ox = s.parameters.ox || 0;
					s.parameters.oy = s.parameters.oy || 0;
				s.word = options.word;
				s.anchor = options.arnchor || false;
				s.parent = options.parent || false;
				s.custom = options.custom || '';
		}else{
			console.log('spae.createWord() - Unknown: Canvas_id');
		}
	};
	

	spae.query = function(canvas_id, sprite_id, callback){
		var o = {};
		let r = false;
		let c = spae.canvases[canvas_id];
		if(c){
			let s = c.sprites[sprite_id];
			if(s){
				if(callback){
					callback(c, s);
				}
				r = s
			}else{
				if(callback){
					callback(c);
				}
				r = c
			}
		}
		return false
	};
	spae.queryParent = function(canvas_id, sprite_id){
		var c = spae.canvases[canvas_id];
		if(c){
			var s = c.sprites[sprite_id];
			if(s){
				if(s.parent){
					var p = spae.queryParent(canvas_id, s.parent);
					if(p){return p}
					return s
				}
				return s
			}
			return false;
		}
		return false
	}	
	
	
	spae.calc = {
		anchor: function(c, s, o){
			if(s.anchor){
				let w = Number(c.canvas.width / Number(c.settings.scale));
				let h = Number(c.canvas.height / Number(c.settings.scale));
				
				if(s.parameters.dx < 0){o.dx = w + s.parameters.dx}
				if(s.parameters.dy < 0){o.dy = h + s.parameters.dy}
			}
			return o
		},
		parent: function(c, s, o){
			if(s.parent){
				let p = c.sprites[s.parent];
				if(p){
					let po = Object.assign({}, p.parameters);
						po = spae.calc.parent(c, p, po);
						po = spae.calc.anchor(c, p, po);
						
					o.dx = Number(po.dx) - Number(po.ox) + Number(o.dx);
					o.dy = Number(po.dy) - Number(po.oy) + Number(o.dy);
				}
			}
			return o
		},
		offset: function(c, s, o){
			if(o.ox){o.dx = o.dx - o.ox}
			if(o.oy){o.dy = o.dy - o.oy}
			return o
		},
		state: function(c, s, o){
			if(s.state){
				if(s.stateInterval){
					s.stateCounter++;
					if(s.stateInterval === s.stateCounter){s.stateFrame++}
					else if(s.stateCounter > s.stateInterval){s.stateCounter = 0}
				}
				if(s.stateFrame > s.states[s.state].length - 1){s.stateFrame = 0}
				if(s.states[s.state][s.stateFrame]){
					if(s.states[s.state][s.stateFrame].sx < 0 && s.states[s.state][s.stateFrame].sy < 0){
						delete spae.canvases[canvas].sprites[sprite_id];
					}
				}
				o.sx = s.states[s.state][s.stateFrame].sx;
				o.sy = s.states[s.state][s.stateFrame].sy;
			}
			return o
		},
		origin: function(c, s, o){
			var mx = Number(c.canvas.width) / 2 / c.settings.scale;
			var my = Number(c.canvas.height) / 2 / c.settings.scale;
						
			var ux = Number(s.parameters.dx) - Number(s.parameters.ox) + (s.parameters.dw / 2);
			var uy = Number(s.parameters.dy) - Number(s.parameters.oy) + (s.parameters.dh / 2);
						
			var ox = mx - ux;
			var oy = my - uy;
			
			return {ox: ox * -1, oy: oy * -1}
		},
	};
	
	
	
	spae.renderSpae = function(){
		if(spae.settings.play === true){
			for(var canvas_id in spae.canvases){
				spae.renderCanvas(spae.canvases[canvas_id]);
				spae.fps.tick();
			}
		}
		window.requestAnimationFrame(spae.renderSpae);
	}
	spae.renderCanvas = function(c){
		if(c.settings.play === true){
			if(typeof c.onRender == 'function'){c.onRender(c)}
			if(c.settings.autoClear === true){
				c.context.clearRect(0, 0, c.canvas.width, c.canvas.height);
			}

			let arr = Object.keys(c.sprites);
				arr = arr.sort(function(a, b){
					let aa = c.sprites[a].parameters.dy + c.sprites[a].parameters.oy;
					let bb = c.sprites[b].parameters.dy + c.sprites[b].parameters.oy;
					if(aa < bb){return -1}
					else if(aa > bb){return 1}
					else{return 0}
				});
				arr = arr.sort(function(a, b){
					let aa = 0;
					if(c.sprites[c.sprites[a].parent]){
						aa = 100 + 1
						if(c.sprites[c.sprites[a].parent].parent){aa = 100 + 10 + 1}
						if(c.sprites[c.sprites[a].parent].anchor){aa = 1000 + 10 + 1}
					}
					if(c.sprites[a].anchor === true){aa = 1000}

					let bb = 0;
					if(c.sprites[c.sprites[b].parent]){
						bb = 100 + 1
						if(c.sprites[c.sprites[b].parent].parent){bb = 100 + 10 + 1}
						if(c.sprites[c.sprites[b].parent].anchor){bb = 1000 + 10 + 1}
					}
					if(c.sprites[b].anchor === true){bb = 1000}

					if(aa < bb){return -1}
					else if(aa > bb){return 1}
					else{return 0}
				});
				
				
			for(var i = 0; i < arr.length; i++){
				let sprite_id = arr[i];
				spae.renderSprite(c, c.sprites[sprite_id]);
			}
		}
	}
	spae.renderSprite = function(c, s){
		let p = spae.queryParent(c.canvas_id, s.sprite_id);

		if(s.hidden === false && p.hidden === false){
			
			if(typeof c.onSprite == 'function'){c.onSprite(c, s)}
			if(typeof s.onRender == 'function'){s.onRender(c, s)}
			
			let o = Object.assign({}, s.parameters);
				o = spae.calc.anchor(c, s, o);
				o = spae.calc.parent(c, s, o);
				o = spae.calc.offset(c, s, o);
				o = spae.calc.state(c, s, o);
				spae.hoverSprite(c, s, o);

			if(s.text){

				let str = s.text.font.replace(/[^0-9]*/gmi,'');
				let num = Number(c.settings.scale) * Number(str);

				c.context.fillStyle = s.text.color;
				c.context.font = s.text.font;
				c.context.fillText(s.text.text, o.dx, o.dy);

			}else if(s.word){
				let f = spae.fonts[s.font_id];
				if(f){
					var arr = s.word.split('');
						arr.forEach(function(v,i){
							var value = v;
								if(f.onRender){value = f.onRender(v)}
							var index = f.srcmap.indexOf(value);
							if(index < -1){o.sx = -1 * Number(f.settings.width)}
							else{
								o.sx = (index + 1) * Number(f.settings.width) - Number(f.settings.width);
							}
							o.dx = o.dx + o.dw;
							c.context.drawImage(f.img, o.sx, 0, f.settings.width, f.settings.height, o.dx, o.dy, o.dw, o.dh);
						});
				}
			}else{
				c.context.drawImage(s.img, o.sx, o.sy, o.sw, o.sh, o.dx, o.dy, o.dw, o.dh);
			}
		}
	}
	spae.hoverSprite = function(c, s, o){
		if(s.onMouseOver || s.onMouseOff || s.onClick || s.onRightClick || s.onDrag){
			if(	c.actions.hoveredPosition.x > o.dx &&
				c.actions.hoveredPosition.x < o.dx + o.dw &&
				c.actions.hoveredPosition.y > o.dy &&
				c.actions.hoveredPosition.y < o.dy + o.dh
			){
				if(c.actions.hoveredSprite !== s.sprite_id){
					c.actions.hoveredSprite = s.sprite_id;
					if(s.onMouseOver){
						s.onMouseOver(c, s, c.actions.hoveredPosition);
					}
				}
			}else if(c.actions.hoveredSprite === s.sprite_id){
				c.actions.hoveredSprite = '';
				if(s.onMouseOff){
					s.onMouseOff(c, s, c.actions.hoveredPosition);
				}
			}
		}
	}
	



	window.requestAnimationFrame(spae.renderSpae);
