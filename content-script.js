(function(){
	let translated = [];
	let alltries = [];
	let cache = [];
	
	let config = {

		launched: false,
		
		user: {},
	
		mainWrap: "translate-ext",
		subtitleWrap: "subtitle-wrap",

		translatedSentence: "sent-tr-open",   
			
		translationWrap: "translation-wrap",
		openRightPanel:"open-tr-panel",
		closeRightPanel:"tr-close-x", 
		
		imgWrap: "img-tr-wrap",
		imgWrapTitle: "img-tr-tile",
		
		dsecriptionWrap: "describe-tr-wrap",   
		dsecriptionTitle: "describe-tr-title",
		
		mainTranslateId: "translate-ext-main-tr",
		mainTranslateOpenClass: "open-bg-tr",
			   
		gimages: 'https://www.googleapis.com/customsearch/v1?&num=9&cx=017663620470495640824%3A3gyica0r5wy&filter=1&imgType=photo&safe=high&searchType=image&start=1&key=AIzaSyB4irElN8L3wOVcwwa2PnobvM0-FJOc2m8&q=',
		gtans: 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&dt=t&dj=1&source=icon&tk=467103.467103&q=',
		ftran: 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&hl=en-US&dt=t&dt=bd&dj=1&q=',
	};
	
	function get_options() {
		  chrome.storage.sync.get({
			lang: 'ru',
			showsec: 5,
			delay: true,
			images: false,
		  }, function(items) {
				config.user = {
					lang: items.lang,
					delay: items.delay,
					showsec: items.showsec,
					images: items.images,
				}
		  });
	};


	function createTapeWrap(){

	  let frameDiv = document.createElement('div');
	  frameDiv.id = config.mainWrap;
	  document.body.appendChild(frameDiv);

	  let subDiv= document.createElement('div');
	  subDiv.id = config.subtitleWrap;
	  document.querySelector('#'+config.mainWrap).appendChild(subDiv);
	  
	  
	  let wordDiv= document.createElement('div');
	  wordDiv.id = config.translationWrap;
	  document.querySelector('#'+config.mainWrap).appendChild(wordDiv); 
	  

	  document.querySelector('#'+config.translationWrap).innerHTML =
				  '<div id="'+config.closeRightPanel+'"></div><div class="tr-title"  id="'+config.dsecriptionTitle+'"></div>\n\
				   <div id="'+config.dsecriptionWrap+'">\n\</div>\n\
				   <div class="tr-title" id="'+config.imgWrapTitle+'"></div> \n\
				   <div id="'+config.imgWrap+'"></div>  \n\
	  ';
	  
	  let centerTranslateDiv = document.createElement('div');
	  centerTranslateDiv.id = config.mainTranslateId;
	  document.body.appendChild(centerTranslateDiv);
	  
	}
	createTapeWrap();


	function loadJson(url, calback){

		if(cache[url]){
			return calback(cache[url]);		
		}
		
		fetch(url).then(function(res) {
					if (res.status >= 200 && res.status < 300) {
						return Promise.resolve(res)
					} else {
						return Promise.reject(new Error(res.statusText))
					}
				}).then(function(res) {
					return res.json()
				}).then(function(data) {
					cache[url] = data;
					return calback(data);				
				}).catch(function(err) {
					//console.log('Fetch Error :-S', err);  
				});	
	}





	function subtitleSentence(){
		let self;
		return{
			add:function(subtitle){
				document
				.querySelector('#'+config.mainWrap+' #'+config.subtitleWrap)
				.insertAdjacentHTML('beforeend', "<dl><dt>"+subtitle.replace(/([a-z'\-]+)/gi, '<span>$1</span>')+"</dt><dd></dd></dl>");

				self = this;
				self.scroll();
				self.addClickListner();
			},
			scroll:function(){
				let elm = document.querySelector('#'+config.mainWrap+' #'+config.subtitleWrap);
				if(elm.offsetHeight + elm.scrollTop + 150 > elm.scrollHeight){
					elm.scrollBy(0, 300);
				}

			},
			addClickListner:function(){
				let nodes = document.querySelectorAll('#'+config.mainWrap+' #'+config.subtitleWrap +" dl");
				nodes[nodes.length- 1].addEventListener('click', self.clickedWordORSent);
			},
			clickedWordORSent:function(event){
						
				if(event.target.nodeName ==='SPAN'){
					return traslatePanel().start(event.target.textContent);
				}else{
					return self.translateSentence(event.target);
				}
				
			},	
			translateSentence: function(el){
			

				
				 let sentence = el.textContent.toLowerCase();
				 
				 if(sentence == '') return false;
				 
				 if(el.nodeName !=='DL') while ((el = el.parentElement) && !el.nodeName ==='DL');
				 
				 if(typeof el == 'undefined'){ return false;}
				 
				 if(el.classList.contains(config.translatedSentence)){ return false;}

				 el.classList.add(config.translatedSentence);
				 
				
				loadJson(config.gtans+encodeURI(sentence)+"&tl="+config.user.lang, function(data){
					let gtrans = '';
					data['sentences'].forEach(function(sentence){ 
							gtrans += sentence.trans +' ';
					});
					
					el.querySelector('dd').textContent = gtrans;
				})		 
				 
			}
		}
	}



	function traslatePanel(word){
			let self;
			return{
				start: function(word){
					self = this;
					document.querySelector('#'+config.mainWrap).classList.add(config.openRightPanel);
					
					document.querySelector('#'+config.dsecriptionTitle).innerHTML = "<span>"+word+"</span>";
					
					document.querySelector('#'+config.imgWrap).textContent = '';
					
					if(config.user.images){ loadJson(config.gimages+encodeURI(word), this.addImages); }
					
					loadJson(config.ftran+encodeURI(word)+"&tl="+config.user.lang, this.wordTranslate);

					self.close();
					self.voice(word);
				},
				voice:function(word){
		
				
					let msg = new SpeechSynthesisUtterance(word);
					msg.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name == 'Google US English'; })[0]; // chrome voice bug
					msg.rate=0.5;
					msg.volume=0.7;
					msg.lang = 'en-US';	
					
					document.querySelector('#'+config.dsecriptionTitle+' span').addEventListener('click', function(e) {
						msg.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name == 'Google US English'; })[0]; // chrome voice bug
						speechSynthesis.speak(msg);
					}, false);
				},
				close: function(){
					document.querySelector('#'+config.closeRightPanel).addEventListener('click', function(e) {
						document.querySelector('#'+config.mainWrap).classList.remove(config.openRightPanel);
					}, false);			
				},
				addImages :function(data){
					data['items'].forEach(function(item){ 				
						document.querySelector('#'+config.imgWrap).insertAdjacentHTML('beforeend', '<img src="'+item.image.thumbnailLink+'">');
					});
				},
				wordTranslate: function(data){

					document.querySelector('#'+config.mainWrap+' #'+config.dsecriptionWrap).innerHTML = '';
					
					if(data['sentences'][0]['trans']){
							document.querySelector('#'+config.dsecriptionTitle).insertAdjacentHTML('beforeend', ' — ' + data['sentences'][0]['trans']);
					}
				
					try{
						data['dict'].forEach(function(block){
								let items = [];
								let limit = 3;
								try{
									block['entry'].forEach(function(ceil){ 
										items[ceil['word']] = ceil['reverse_translation'];
										if(--limit == 0){ throw 'BreakException';}
									});
								} catch (e) {
									if (e !== 'BreakException') throw e;
								}	
						
							self.addToWrap(block['pos'],items);	
						});
					}catch(e){
					}
				},
			
				addToWrap:function(type,items){
								
					let html = '<i>'+type+'</i>';

					for (var key in items) {
						html += '<dl>';
						html += '<dt>'+key+'</dt>';
						html += '<dd>'+items[key].join(", ")+'</dd>';
						html += '</dl>';
					}
						
					document.querySelector('#'+config.mainWrap+' #'+config.dsecriptionWrap)
							.insertAdjacentHTML('beforeend', html);		
						
			
				}
						
			}

	}


	function pause(){
		let self;
		return{
			setEvent:function(){
				self = this;
				document.querySelector('.PlayerControlsNeo__button-control-row').addEventListener('click', function(e) {
					if(e.y > 190) {return false;}
					self.toggle();
				}, false);			
			},
			start:function(){
				try{
					document.querySelector('.button-nfplayerPlay').click();
				}catch(e){}
					
			},
			stop:function(){
				try{
					document.querySelector('.button-nfplayerPause').click();
				}catch(e){}			
			},	
			toggle:function(){
				try{
					if(document.querySelector('.button-nfplayerPause')){
						document.querySelector('.button-nfplayerPause').click();
					}else{
						document.querySelector('.button-nfplayerPlay').click();
					}
				}catch(e){}	
			},			
		}
	}



	let tmd;
	function centerTranslator(){
		let self,elm;
		return{
			init:function(sentence){
				self = this;
				elm = document.querySelector('#'+config.mainTranslateId);
				try{
						document.querySelectorAll('.player-timedtext-text-container').forEach(function(elem) {
						elem.addEventListener('click', function(){
							self.translate(sentence);
						});
						
					});
				}catch(e){
				
				}
			},
			translate:function(sentence){
				self.clear();
				if(config.user.delay){pause().stop();}
				loadJson(config.gtans+encodeURI(sentence)+"&tl="+config.user.lang, function(data){
					data['sentences'].forEach(function(sentence){ 
							elm.textContent += sentence.trans +' ';
					});
					if(elm.textContent !== ''){ self.show();}else{pause().start();}
				})			
			
				
				
			},			
			show: function(){
				elm.classList.add(config.mainTranslateOpenClass);
				clearTimeout(tmd);
				
				tmd = setTimeout(function(){
					self.clear(); 
					if(config.user.delay){pause().start();}
				},config.user.showsec*1000);
			},
			clear: function(){
					elm.classList.remove(config.mainTranslateOpenClass);
					elm.textContent = '';
			},		
		}

	}


	
	function run(item){

			config.launched = true;
			pause().setEvent();
			get_options();
			
			let query = '';
			let queryBefore = '';
			let wait = false;
			let subtitleBefore = '';
			item.addEventListener("DOMNodeInserted", function (e) {
			
				if(wait){return false;}
				wait = true;
				let subtitle = '';
				
				setTimeout(function(){
					
					wait = false;
					try{
						let firstSub = item.querySelector('span').textContent;
						item.querySelectorAll('span').forEach(function(span) {
							subtitle += span.textContent+" ";
						});
								
					}catch(e){
						return false;
					}		
					
					if(subtitle == subtitleBefore){
						return false;
					}
					
					centerTranslator().init(subtitle);
					subtitleSentence().add(subtitle);				
					subtitleBefore = subtitle;
					
				},100)

				
				
			}, false);	
	}
	
	
	let intv = setInterval(function(){

		let item = document.querySelector('.player-timedtext');
		if(item && document.querySelector('.PlayerControlsNeo__button-control-row')){
			if(!config.launched){
				run(item);
			}
		}else{
			config.launched = false;	
			document.querySelector('#'+config.mainWrap+' #'+config.subtitleWrap).innerHTML = '';
		}
		
	},1000);


})();






chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

  
	if(request.buttonClick){
				if(!window.location.href.match(/.+:\/\/.+netflix\.com\/watch\//)){
				return false
			}
			let bdclist = document.querySelector('body').classList;
			(bdclist.contains('open-tr-panel')) ? bdclist.remove('open-tr-panel') : bdclist.add('open-tr-panel');
	
	}

});