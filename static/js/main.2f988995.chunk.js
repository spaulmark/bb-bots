(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{165:function(e,t,n){"use strict";n.r(t);var a=n(0),i=n.n(a),r=n(57),s=n.n(r),c=n(1),o=n(2),l=n(6),u=n(4),h=n(5),m=n(9),v=(n(69),n(3)),p=function e(t){Object(c.a)(this,e),this.name="",this.imageURL="",this.evictedImageURL="BW",t&&Object.assign(this,t)},d=function(e){function t(e){var n;return Object(c.a)(this,t),(n=Object(l.a)(this,Object(u.a)(t).call(this,e))).isEvicted=!1,n.isJury=!1,n.id=0,n.nominations=0,n.hohWins=0,n.povWins=0,n.popularity=0,n.relativeEquity=0,n.deltaPopularity=0,n.relationships={},Object.assign(Object(m.a)(Object(m.a)(n)),e),n}return Object(h.a)(t,e),t}(p),f=n(14),g=n.n(f);function b(e){return e?Math.round(100*e):0}function E(e,t){for(var n={},a=0;a<e;a++)a!==t&&(n[a]=0);return n}var y=n(7),w=n(27),O=n(166),j=new O.a([]);function k(){return j.value}var S=function(){function e(){Object(c.a)(this,e),this.view=new Ae({controller:this})}return Object(o.a)(e,[{key:"inject",value:function(e){this.view=e}}]),e}(),x=function(){function e(t){Object(c.a)(this,e),this.rng=void 0,this.rng=w.a.xorshift128plus(t)}return Object(o.a)(e,[{key:"randomFloat",value:function(){var e,t=this.rng.next(),n=Object(y.a)(t,2);return e=n[0],this.rng=n[1],e/2147483647}},{key:"randomInt",value:function(e,t){var n,a=w.a.uniformIntDistribution(e,t,this.rng),i=Object(y.a)(a,2);return n=i[0],this.rng=i[1],n}},{key:"seed",value:function(e){this.rng=w.a.xorshift128plus(e)}}]),e}();function C(){return N.value}var N=new O.a(new x(0)),W=(j.subscribe({next:function(e){var t="";e.forEach(function(e){return t+=e.name}),N.next(new x(function(e){var t,n=0;if(0===e.length)return n;for(t=0;t<e.length;t++)n=(n<<5)-n+e.charCodeAt(t),n|=0;return n}(t)))}}),{r:137,g:252,b:137}),H={r:252,g:137,b:137},_={r:51,g:255,b:249};function U(e){var t=Math.round(e).toString(16);return 1==t.length?"0"+t:t}function I(e,t,n){return"#"+U(e)+U(t)+U(n)}function R(e,t){if(t&&(t>1||t<-1))return I(_.r,_.g,_.b);var n=(function(e){if(!e)return 0;var t=e*e;return e>=0?2*e-t:t+2*e}(t)+1)/2;return e.isEvicted?void 0:I(H.r+n*(W.r-H.r),H.g+n*(W.g-H.g),H.b+n*(W.b-H.b))}var L=new O.a(null);function P(){return L.value}var B=n(38),D=function(e){function t(e){var n;return Object(c.a)(this,t),(n=Object(l.a)(this,Object(u.a)(t).call(this,e))).sub=null,n.state={popularity:n.props.popularity},n}return Object(h.a)(t,e),Object(o.a)(t,[{key:"componentDidMount",value:function(){var e=this;Object(B.isNullOrUndefined)(this.props.id)||(this.sub=L.subscribe({next:function(t){t?(t=t).id!==e.props.id?e.setState({popularity:t.relationships[e.props.id]}):e.setState({popularity:2}):e.setState({popularity:e.props.popularity})}}))}},{key:"componentWillUnmount",value:function(){this.sub&&(this.sub.unsubscribe(),this.sub=null)}},{key:"onClick",value:function(){if(!Object(B.isNullOrUndefined)(this.props.id)&&this.props.relationships){var e,t={id:this.props.id,relationships:this.props.relationships};e=t,P()&&P().id===e.id?L.next(null):L.next(e)}}},{key:"render",value:function(){var e=this,t=this.props,n="BW"===t.evictedImageURL?t.imageURL:t.evictedImageURL,a=t.isEvicted?n:t.imageURL,r=function(e){var t=e.isEvicted&&"BW"===e.evictedImageURL?"grayscale":"";return t=e.isJury?"sepia":t}(t),s=[];t.generateSubtitle&&(s=t.generateSubtitle(this.props,this.state));var c="";return t.isJury?c="jury":t.isEvicted&&(c="evicted"),i.a.createElement("div",{onClick:function(){return e.onClick()},style:{backgroundColor:R(t,this.state.popularity)},className:"memory-wall-portrait ".concat(c)},i.a.createElement("img",{className:r,src:a,style:{width:100,height:100}}),i.a.createElement("br",null),t.name,i.a.createElement("br",null),!!t.generateSubtitle&&i.a.createElement("small",{className:"portrait-history"},s))}}]),t}(i.a.Component);n(73);function z(e,t,n){var a=0,r=t.popularity;r&&(r>1||r<-1)&&(r=e.popularity);var s=[];if(r&&!e.isEvicted){var c="".concat(b(r),"%"),o=function(e,t){if(b(e.popularity)!==b(t))return 0;return e.deltaPopularity?b(e.deltaPopularity):0}(e,r);if(n&&0!==o)c+="".concat(o>0?" | \u2191":" | \u2193"," ").concat(o,"%");s.push(i.a.createElement("div",{key:a++},c))}return s.push(i.a.createElement("div",{key:a++},"".concat(A(e)))),"".concat(A(e))||s.push(i.a.createElement("br",{key:a++})),s}function M(e,t){return z(e,t,!1)}function T(e,t){return z(e,t,!0)}function A(e){return"".concat(e.hohWins?"\u2654 ".concat(e.hohWins):"").concat(e.povWins&&e.hohWins?"|\ud83d\udec7 ".concat(e.povWins):e.povWins?"\ud83d\udec7 ".concat(e.povWins):"").concat((e.hohWins||e.povWins)&&e.nominations?"|":"").concat(e.nominations?"\u2718 ".concat(e.nominations):"")}function F(e,t){return i.a.createElement(D,Object.assign({},e,{key:t,generateSubtitle:M}))}function J(e){return i.a.createElement("div",{className:"columns is-gapless is-mobile is-multiline ".concat(e.centered&&"is-centered")},F(e.houseguest))}function q(e){var t=0,n=[];return e.houseguests&&0!==e.houseguests.length?(e.houseguests.forEach(function(a){e.detailed?n.push(function(e,t){return i.a.createElement(D,Object.assign({},e,{key:t,generateSubtitle:T}))}(a,t++)):n.push(F(a,t++))}),i.a.createElement("div",{className:"columns is-gapless is-mobile is-multiline ".concat(e.centered&&"is-centered")},n)):i.a.createElement("div",null)}function V(e){return i.a.createElement("div",{className:"memory-wall"},function(e){if(!e.houseguests||0===e.houseguests.length)return null;return i.a.createElement("div",{style:{margin:"auto",maxWidth:e.houseguests.length<30?700:-1}},i.a.createElement(q,{houseguests:e.houseguests,centered:!0,detailed:!0}))}(e))}var K=n(63),$=n(39),G=n.n($),Q=n(58),X=n(59),Y=function(e){function t(e){var n;return Object(c.a)(this,t),(n=Object(l.a)(this,Object(u.a)(t).call(this,e))).state={name:e.name},n}return Object(h.a)(t,e),Object(o.a)(t,[{key:"componentWillReceiveProps",value:function(e){this.setState({name:e.name})}},{key:"render",value:function(){var e=this;return i.a.createElement("div",{className:"edit-portrait"},i.a.createElement("div",{style:{textAlign:"center"}},i.a.createElement("div",{className:"x-button noselect",onDoubleClick:function(){return e.props.onDelete()}},"\u2718"),i.a.createElement("img",{src:this.props.imageUrl,style:{width:100,height:100}}),i.a.createElement("br",null),i.a.createElement("input",{className:"memory-wall-portrait",contentEditable:!0,onChange:function(){return e.props.onChange},spellCheck:!1,value:this.state.name})))}}]),t}(i.a.Component),Z=function(e){function t(e){var n;return Object(c.a)(this,t),(n=Object(l.a)(this,Object(u.a)(t).call(this,e))).state={text:""},n}return Object(h.a)(t,e),Object(o.a)(t,[{key:"onSubmit",value:function(){var e=this.state.text.split(/\r?\n/),t=[];e.forEach(function(e){var n=e.split("/").pop(),a=n?n.split("#")[0].split("?")[0].replace(/\.[^\/.]+$/,"").replace(/[-_]/g," "):null;e.substr(0,e.indexOf(" "))&&(a=e.substr(e.indexOf(" ")+1)),a&&t.push({name:a,imageURL:e,evictedImageURL:"BW"})}),this.props.onSubmit(t),this.setState({text:""})}},{key:"render",value:function(){var e=this;return i.a.createElement("div",{className:this.props.className},i.a.createElement("textarea",{className:"textarea",onChange:function(t){e.setState({text:t.target.value})},value:this.state.text}),i.a.createElement("button",{onClick:function(){return e.onSubmit()}},"Import links"))}}]),t}(i.a.Component),ee={eliminates:0,canPlayWith:function(e){return e>2}},te=function e(t){Object(c.a)(this,e),this.title="Pregame",this.scenes=[],this.render=void 0,this.gameState=void 0,this.type=ee,this.gameState=t,this.render=i.a.createElement(se,{cast:t.houseguests})},ne=function(e){function t(e){var n;return Object(c.a)(this,t),(n=Object(l.a)(this,Object(u.a)(t).call(this,e))).appendProfiles=function(e){var t=Object(v.a)({},n.state);e.forEach(function(e){return t.players.push(e)}),n.setState(t)},n.submit=Object(Q.a)(G.a.mark(function e(){return G.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return t=n.state.players,j.next(t),ce.next(i.a.createElement(se,{cast:n.state.players})),e.next=4,he(null);case 4:return e.next=6,he(new te(new ze(n.state.players)));case 6:case"end":return e.stop()}var t},e)})),n.handleDrop=function(e,t){var a=Object(v.a)({},n.state);if(e){for(var i=0;i<e.length;i++){var r=e[i];r.type.match(/image\/*/)&&a.players.push(new p({name:r.name.substr(0,r.name.lastIndexOf("."))||r.name,imageURL:URL.createObjectURL(r),evictedImageURL:"BW"}))}n.setState(a)}},n.state={players:e.cast||[]},n}return Object(h.a)(t,e),Object(o.a)(t,[{key:"handleChange",value:function(e){var t=this;return function(n){var a=n.target.value.replace(/\r?\n|\r/g,""),i=Object(v.a)({},t.state);i.players[e]=new p({imageURL:i.players[e].imageURL,name:a,evictedImageURL:i.players[e].evictedImageURL}),t.setState(i)}}},{key:"deleteMethod",value:function(e){var t=this;return function(){var n=Object(v.a)({},t.state);n.players.splice(e,1),t.setState(n)}}},{key:"getFiles",value:function(){var e=this,t=this.state.players;if(t){var n=[],a=0;return t.forEach(function(t){return n.push(i.a.createElement(Y,{name:t.name,imageUrl:t.imageURL,onDelete:e.deleteMethod(a),onChange:e.handleChange(a),key:(++a).toString()}))}),i.a.createElement("div",{className:"columns is-gapless is-mobile is-multiline is-centered"},n)}}},{key:"random",value:function(e){var t=this.state.players;t=(t=Object(f.shuffle)(t)).slice(0,e),this.setState({players:t})}},{key:"render",value:function(){var e=this;return i.a.createElement(X.a,{onDrop:this.handleDrop},i.a.createElement("div",{className:"level"},i.a.createElement(Z,{onSubmit:this.appendProfiles}),i.a.createElement("div",{className:"level-item"},i.a.createElement("button",{className:"button is-danger",onClick:function(){return e.setState({players:[]})}},"Delete all")),i.a.createElement("div",{className:"level-item"},i.a.createElement("div",{className:" button is-primary",onClick:function(){return e.random(16)}},"Random 16")),i.a.createElement("div",{className:"level-item"},i.a.createElement("button",{className:"button is-primary",disabled:this.state.players.length<3,onClick:this.submit},"Submit"))),"~ Drop images ~",this.getFiles())}}]),t}(i.a.Component);n(78);function ae(){return i.a.createElement("div",{className:"topbar-link",onClick:function(){ce.next(i.a.createElement(ne,{cast:k()}))}},"Edit Cast")}function ie(){return i.a.createElement("div",{className:"topbar-link",onClick:function(){ce.next(i.a.createElement(ne,{cast:k()}))}},"Edit Season")}function re(){return i.a.createElement("div",{className:"level box is-mobile",style:{marginTop:30}},i.a.createElement("div",{className:"level-item"},i.a.createElement(ae,null)),i.a.createElement("div",{className:"level-item"},i.a.createElement(ie,null)))}function se(e){return 0===e.cast.length?i.a.createElement("div",null,"Cast is empty. ",i.a.createElement(ae,null)):i.a.createElement("div",null,"Welcome to Big Brother!",i.a.createElement(V,{houseguests:e.cast}),i.a.createElement(pe,null))}var ce=new O.a(i.a.createElement(se,{cast:[]})),oe=function(e){function t(e){var n;return Object(c.a)(this,t),(n=Object(l.a)(this,Object(u.a)(t).call(this,e))).contentStream=void 0,n.state={content:null},n}return Object(h.a)(t,e),Object(o.a)(t,[{key:"componentWillMount",value:function(){var e=this;this.contentStream=ce.subscribe(function(t){e.setState({content:t})})}},{key:"componentWillUnmount",value:function(){this.contentStream.unsubscribe()}},{key:"render",value:function(){return i.a.createElement("div",{className:"box"},this.state.content)}}]),t}(i.a.Component),le=new O.a(null),ue=new K.a;function he(e){le.next(e)}function me(e){ue.next(e)}var ve=function(){function e(t){var n=this;Object(c.a)(this,e),this.view=void 0,this.subscriptions=[],this.season=new Ue,this.scenes=[],this.selectedEpisode=0,this.switchSceneRelative=function(e){var t=n.view.state.selectedScene,a=n.scenes.length,i=t+e;if(!(i<0)){var r=n.view.state.episodes[n.view.state.episodes.length-1];if(i<a)n.switchToScene(i);else if(i===a){var s=r.gameState,c=Pe(r.gameState).length,o=n.season.whichEpisodeType(c);c>2&&(he(n.season.renderEpisode(s,o)),n.switchSceneRelative(1))}}},this.view=t,this.subscriptions.push(le.subscribe({next:function(e){return n.onNewEpisode(e)}})),this.subscriptions.push(ue.subscribe({next:function(e){return n.switchSceneRelative(e)}})),this.subscriptions.push(j.subscribe({next:function(e){return n.season=new Ue}}))}return Object(o.a)(e,[{key:"getSelectedEpisode",value:function(){return this.selectedEpisode}},{key:"switchToScene",value:function(e){ce.next(this.scenes[e].scene.render),this.selectedEpisode=this.scenes[e].index,this.view.setState({selectedScene:e})}},{key:"handleKeyDown",value:function(e){37===e.keyCode?me(-1):39===e.keyCode&&me(1)}},{key:"onNewEpisode",value:function(e){var t=this;if(e){var n=Object(v.a)({},this.view.state),a=(0===this.scenes.length?-1:this.scenes[this.scenes.length-1].index)+1;this.scenes.push({scene:e,index:a}),e.scenes.forEach(function(e){return t.scenes.push({scene:e,index:a})}),n.episodes.push(e),this.view.setState(n)}else this.view.setState({episodes:[],selectedScene:0}),this.scenes=[]}},{key:"destroy",value:function(){this.subscriptions.forEach(function(e){return e.unsubscribe()})}}]),e}();function pe(){return i.a.createElement("button",{className:"button is-primary",onClick:function(){return me(1)}},"Continue")}var de=function(e,t){return e.relationships[t.id]};function fe(e,t,n){var a=0,i=-1/0;return t.forEach(function(t,r){var s=n(e,t);s>i&&(a=r,i=s)}),a}function ge(e,t,n){var a=Be(n),i=a.length/He(),r=1-i;return De(t,a)*i+(e.id!==t.id?De(t,Re(Pe(n),[e])):t.popularity)*r}function be(e,t,n){var a=0;if(function(e){return e.remainingPlayers-2<=He()}(n)){var i=Be(n).length,r=3===n.remainingPlayers?1:e.relativeEquity;a=1-(He()-i-1)/He()*r}return a*ge(e,t,n)+(1-a)*-de(e,t)}function Ee(e,t,n){return fe(e,t,function(e,t){return be(e,t,n)})}function ye(e,t,n){return t[fe(e,t,function(e,t){return be(e,t,n)})].id}function we(e,t){return fe(e,t,de)}var Oe={canPlayWith:function(e){return e>1},eliminates:1};function je(e,t,n,a){var r,s="";n[0]=Ie(e,n[0].id),n[1]=Ie(e,n[1].id),t=Ie(e,t.id),(r=function(e,t,n){var a=null;if(e.id==t[0].id||e.id==t[1].id)a=e;else{var i=-1,r=be(e,t[0],n),s=be(e,t[1],n);(r<0||s<0)&&(i=Math.min(r,s)===r?0:1),4!==Pe(n).length&&i>-1&&(a=t[i])}return a}(a,n,e))?a.id==n[0].id||a.id==n[1].id?s+="...to use the power of veto on myself.":s+="...to use the power of veto on ".concat(r.name,"."):s+="... not to use the power of veto.";var c="",o="",l=n;if(r){l=n.filter(function(e){return e.id!=r.id}),o+=" ".concat(t.name,", since I have just vetoed one of your nominations, you must name a replacement nominee.");var u=Object(v.a)({},Ie(e,ye(t,Re(e.houseguests,[t,n[0],n[1],a]),e)));u.nominations++,l.push(u),Ie(e,u.id).nominations++,c="My replacement nominee is ".concat(u.name,".")}return[{title:"Veto Ceremony",gameState:e,render:i.a.createElement("div",null,"This is the Veto Ceremony.",i.a.createElement("br",null),"".concat(n[0].name," and ").concat(n[1].name," have been nominated for eviction."),i.a.createElement(q,{houseguests:n}),"But I have the power to veto one of these nominations.",i.a.createElement("br",null),i.a.createElement("b",null,"I have decided...",i.a.createElement(J,{houseguest:a}),s),o,c&&i.a.createElement(J,{houseguest:t}),i.a.createElement("b",null,c),i.a.createElement(q,{houseguests:l}),i.a.createElement(pe,null))},l]}function ke(e,t){var n=Ie(e,t);n.isEvicted=!0,e.remainingPlayers-2<=He()&&(n.isJury=!0),e.remainingPlayers--}var Se=function e(t){var n,a,r;Object(c.a)(this,e),this.title=void 0,this.scenes=[],this.render=void 0,this.gameState=void 0,this.type=Oe;var s,o,l=function(e){var t=new Me(e),n=e.previousHOH?[e.previousHOH]:[],a=Le(t.houseguests,n);t.previousHOH=a,t.phase++,a.hohWins+=1;var r={title:"HoH Competition",gameState:e,render:i.a.createElement("div",null,n.length>0&&"Houseguests, it's time to find a new Head of Household. As outgoing HoH, ".concat(n[0].name," will not compete. "),i.a.createElement(J,{houseguest:a}),a.name," has won Head of Household!",i.a.createElement("br",null),i.a.createElement(pe,null))};return[new ze(t),r,a]}(t),u=Object(y.a)(l,3);n=u[0],a=u[1],r=u[2],this.scenes.push(a);var h,m,p=function(e,t){var n=new Me(e),a=Pe(n),r=Ie(n,ye(t,Re(a,[t]),n)),s=Ie(n,ye(t,Re(a,[t,r]),n));r.nominations++,s.nominations++;var c=Object(f.shuffle)([r,s]),o={title:"Nomination Ceremony",gameState:n,render:i.a.createElement("div",null,i.a.createElement(J,{houseguest:t}),i.a.createElement("br",null),"This is the nomination ceremony. It is my responsibility as the Head of Household to nominate two houseguests for eviction.",i.a.createElement("br",null),i.a.createElement("b",null,"My first nominee is...",i.a.createElement("br",null),i.a.createElement(J,{houseguest:c[0]}),i.a.createElement("br",null),"My second nominee is...",i.a.createElement("br",null),i.a.createElement(J,{houseguest:c[1]}),"I have nominated you, ".concat(c[0].name," and you, ").concat(c[1].name," for eviction."),i.a.createElement("br",null)),i.a.createElement(pe,null))};return[new ze(n),o,[r,s]]}(n,r),d=Object(y.a)(p,3);n=d[0],s=d[1],o=d[2],this.scenes.push(s);var g,b=function(e,t,n,a){var r=new Me(e),s=Pe(r),c=[],o=s.length<=6;if(o)for(c.push(Object(v.a)({},t)),c.push(Object(v.a)({},n)),c.push(Object(v.a)({},a));c.length<s.length;)c.push(Object(v.a)({},Le(s,c)));else c.push(Object(v.a)({},t)),c.push(Object(v.a)({},n)),c.push(Object(v.a)({},a)),c.push(Object(v.a)({},Le(s,c))),c.push(Object(v.a)({},Le(s,c))),c.push(Object(v.a)({},Le(s,c)));var l,u=Le(c);(u=Ie(r,u.id)).povWins++,l=o?"Everyone left in the house will compete in this challenge.":"".concat(t.name,", as Head of Household, and ").concat(n.name," and ").concat(a.name," as nominees, will compete, as well as 3 others chosen by random draw.");var h=[c[3]];c[4]&&h.push(c[4]),c[5]&&h.push(c[5]);var m={title:"Veto Competition",gameState:e,render:i.a.createElement("div",null,"It's time to pick players for the veto competition.",i.a.createElement("br",null),i.a.createElement(q,{houseguests:[t,n,a]}),i.a.createElement("br",null),l,i.a.createElement("br",null),i.a.createElement(q,{houseguests:h}),"...",i.a.createElement(q,{houseguests:[u]}),"".concat(u.name," has won the Golden Power of Veto!"),i.a.createElement("br",null),i.a.createElement(pe,null))};return[new ze(r),m,u]}(n,r,o[0],o[1]),E=Object(y.a)(b,3);n=E[0],h=E[1],m=E[2],this.scenes.push(h);var w,O=je(n,r,o,m),j=Object(y.a)(O,2);g=j[0],o=j[1],this.scenes.push(g);var k=function(e,t,n){var a=new Me(e);n=Object(f.shuffle)(n);var r=[[],[]];Pe(a).forEach(function(e){e.id!==n[0].id&&e.id!==n[1].id&&e.id!==t.id&&r[Ee(e,n,a)].push(e)});var s,c=r[0].length,o=r[1].length,l=c===o,u=0;l&&(u=Ee(t,n,a)),s=c>o?n[0]:o>c?n[1]:n[u],ke(a,s.id);var h=0===c||0===o?"By a unanimous vote...":"By a vote of ".concat(c," to ").concat(o,"..."),m={title:"Live Eviction",gameState:e,render:i.a.createElement("div",null,i.a.createElement("p",{style:{textAlign:"center"}},i.a.createElement("b",null,h," ")),i.a.createElement("div",{className:"columns is-centered"},i.a.createElement("div",{className:"column box"},i.a.createElement(q,{houseguests:r[0],centered:!0})),i.a.createElement("div",{className:"column box"},i.a.createElement(q,{houseguests:r[1],centered:!0}))),l&&i.a.createElement("div",null,i.a.createElement("p",{style:{textAlign:"center"}},i.a.createElement("b",null," We have a tie.")," ",i.a.createElement("br",null),"".concat(t.name,", as current Head of Household, you must cast the sole vote to evict.")),i.a.createElement(q,{houseguests:[t],centered:!0}),i.a.createElement("p",{style:{textAlign:"center"}},i.a.createElement("b",null,"I vote to evict ","".concat(s.name,".")))),i.a.createElement(q,{houseguests:[Ie(a,n[0].id),Ie(a,n[1].id)],centered:!0}),i.a.createElement("p",{style:{textAlign:"center"}},i.a.createElement("b",null,"".concat(s.name,"... you have been evicted from the Big Brother House."))),i.a.createElement(pe,null))};return[a,m]}(n,r,o),S=Object(y.a)(k,2);n=S[0],w=S[1],this.scenes.push(w),this.title="Week ".concat(n.phase),this.render=i.a.createElement("div",null,"Week ".concat(n.phase),i.a.createElement(V,{houseguests:t.houseguests})," ",i.a.createElement("br",null),i.a.createElement(pe,null)),this.gameState=new ze(n)},xe={canPlayWith:function(e){return 3===e},eliminates:2};var Ce=function e(t){var n,a,r;Object(c.a)(this,e),this.title=void 0,this.scenes=[],this.render=void 0,this.gameState=void 0,this.type=xe,this.title="Finale",this.render=i.a.createElement("div",null,"Finale Night",i.a.createElement(V,{houseguests:t.houseguests})," ",i.a.createElement("br",null),i.a.createElement(pe,null));var s,o=function(e){var t=new Me(e),n=Pe(e),a=Le(n),r=n.filter(function(e){return e.id!==a.id}),s=Le(n,[a]),c=Ie(t,Le([a,s]).id);c.hohWins++;var o={title:"Final HoH Competition",gameState:t,render:i.a.createElement("div",null,i.a.createElement("p",null,"The final 3 houseguests compete in the endurance competition."),i.a.createElement(q,{houseguests:n}),i.a.createElement(J,{houseguest:a}),i.a.createElement("p",null,i.a.createElement("b",null,"".concat(a.name," has won the endurance competition!"))),i.a.createElement("hr",null),i.a.createElement("p",null,"".concat(r[0].name," and ").concat(r[1].name," compete in the skill competition.")),i.a.createElement(q,{houseguests:r}),i.a.createElement(J,{houseguest:s}),i.a.createElement("p",null,i.a.createElement("b",null,"".concat(s.name," has won the skill competition!"))),i.a.createElement("hr",null),i.a.createElement("p",null,"".concat(a.name," and ").concat(s.name," compete in the quiz competition.")),i.a.createElement(q,{houseguests:[a,s]}),i.a.createElement(J,{houseguest:c}),i.a.createElement("p",null,i.a.createElement("b",null,"Congratulations ".concat(c.name,", you are the final Head of Household!"))),i.a.createElement(pe,null))};return t.phase++,[new ze(t),o,c]}(t),l=Object(y.a)(o,3);n=l[0],a=l[1],r=l[2],this.scenes.push(a);var u,h=function(e,t){var n=new Me(e),a=Pe(n).filter(function(e){return e.id!==t.id}),r=a[Ee(t,a,n)];ke(n,r.id);var s={title:"Final Eviction",gameState:n,render:i.a.createElement("div",null,i.a.createElement("div",{style:{textAlign:"center"}},"As the final HoH of the season, ".concat(t.name,", you may now cast the sole vote to evict."),i.a.createElement(J,{houseguest:t,centered:!0}),i.a.createElement("b",null,i.a.createElement("p",null,"I vote to evict ".concat(r.name,"."))),i.a.createElement(q,{houseguests:a,centered:!0}),i.a.createElement("p",null,"It's official... ",r.name,", you will be the final person leaving the Big Brother House.")),i.a.createElement(pe,null))};return[new ze(n),s]}(n,r),m=Object(y.a)(h,2);n=m[0],s=m[1],this.scenes.push(s),u=function(e){for(var t=Be(e),n=Pe(e),a=[0,0],r=t.map(function(e){var t=we(e,n);return a[t]++,t}),s=[],c=0;c<r.length;c++)s.push(i.a.createElement("div",{className:"columns",key:"jury-vote".concat(c)},i.a.createElement(J,{houseguest:t[c]}),i.a.createElement("p",null,i.a.createElement("b",null,"".concat(t[c].name," has voted for..."))),i.a.createElement(J,{houseguest:n[r[c]]})));var o=a[0]>a[1]?n[0]:n[1];return{title:"Jury Votes",gameState:e,render:i.a.createElement("div",null,s,i.a.createElement(J,{houseguest:o}),"Congratulations, ".concat(o.name,", you are the winner of Big Brother!!!"))}}(n),this.scenes.push(u),this.gameState=n},Ne=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:function(e,t){return e>t};Object(c.a)(this,e),this.parent=function(e){return(e+1>>>1)-1},this.left=function(e){return 1+(e<<1)},this.right=function(e){return e+1<<1},this._heap=void 0,this._comparator=void 0,this._heap=[],this._comparator=t}return Object(o.a)(e,[{key:"size",value:function(){return this._heap.length}},{key:"isEmpty",value:function(){return 0==this.size()}},{key:"peek",value:function(){return this._heap[0]}},{key:"push",value:function(){for(var e=this,t=arguments.length,n=new Array(t),a=0;a<t;a++)n[a]=arguments[a];return n.forEach(function(t){e._heap.push(t),e._siftUp()}),this.size()}},{key:"pop",value:function(){var e=this.peek(),t=this.size()-1;return t>0&&this._swap(0,t),this._heap.pop(),this._siftDown(),e}},{key:"replace",value:function(e){var t=this.peek();return this._heap[0]=e,this._siftDown(),t}},{key:"_greater",value:function(e,t){return this._comparator(this._heap[e],this._heap[t])}},{key:"_swap",value:function(e,t){var n=[this._heap[t],this._heap[e]];this._heap[e]=n[0],this._heap[t]=n[1]}},{key:"_siftUp",value:function(){for(var e=this.size()-1;e>0&&this._greater(e,this.parent(e));)this._swap(e,this.parent(e)),e=this.parent(e)}},{key:"_siftDown",value:function(){for(var e=0;this.left(e)<this.size()&&this._greater(this.left(e),e)||this.right(e)<this.size()&&this._greater(this.right(e),e);){var t=this.right(e)<this.size()&&this._greater(this.right(e),this.left(e))?this.right(e):this.left(e);this._swap(e,t),e=t}}}]),e}();var We=function(){function e(){Object(c.a)(this,e)}return Object(o.a)(e,[{key:"nextEpisode",value:function(e,t){var n=new Me(e);0===e.phase&&function(e){for(var t=0;t<e.length;t++)for(var n=e[t].relationships,a=t+1;a<e.length;a++){var i=e[a].relationships,r=C().randomFloat();i[t]=r,n[a]=r}}(n.houseguests),function(e){var t=Pe(e),n=new Ne(function(e,t){return e[1]>t[1]});t.forEach(function(t){var a=De(t,Pe(e));t.deltaPopularity=(b(a)-b(t.popularity))/100,t.popularity=a,n.push([t,ge(t,t,e)])});for(var a=n.size();n.size()>0;)Ie(e,n.pop()[0].id).relativeEquity=(n.size()+1)/a}(n);var a=new ze(n);switch(t){case Oe:return new Se(a);case xe:return new Ce(a);default:throw new Error("Unsupported Episode Type")}}}]),e}();function He(){return _e}var _e=7;j.subscribe({next:function(e){var t=e.length;(t=Math.round(.55*t))%2===0&&t--,_e=t}});var Ue=function(){function e(){Object(c.a)(this,e),this.factory=void 0,this.factory=new We}return Object(o.a)(e,[{key:"renderEpisode",value:function(e,t){return this.factory.nextEpisode(e,t)}},{key:"whichEpisodeType",value:function(e){return 3===e?xe:Oe}}]),e}();function Ie(e,t){var n=e.houseguests.find(function(e){return e.id===t});if(!n)throw new Error("Failed to find houseguest with id ".concat(t));return n}function Re(e,t){var n=t.map(function(e){return e.id});return e.filter(function(e){return!n.includes(e.id)&&!e.isEvicted})}function Le(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[];if(0===e.length)throw new Error("Tried to get a random player from a list of 0 players.");var n=Re(e,t);return n[C().randomInt(0,n.length-1)]}function Pe(e){return e.houseguests.filter(function(e){return!e.isEvicted})}function Be(e){return e.houseguests.filter(function(e){return e.isJury})}function De(e,t){var n=0,a=0,i=e.id;return t.forEach(function(e){e.id!==i&&(a++,n+=e.relationships[i])}),0===a?0:n/a}var ze=function e(t){var n=this;if(Object(c.a)(this,e),this.houseguests=[],this.remainingPlayers=0,this.phase=0,this.previousHOH=void 0,t instanceof Array){var a=t;this.remainingPlayers=a.length;var i=-1;a.forEach(function(e){n.houseguests.push(new d(Object(v.a)({},e,{isEvicted:!1,isJury:!1,id:++i,nominations:0,hohWins:0,povWins:0,popularity:0,relativeEquity:0,deltaPopularity:0,relationships:E(a.length,i)})))})}else Object.assign(this,t)},Me=function e(t){Object(c.a)(this,e),this.houseguests=[],this.remainingPlayers=0,this.phase=0,this.previousHOH=void 0;var n=g.a.cloneDeep(t);Object.assign(this,n)};n(60),n(61),n(62);var Te=function(e){function t(e){var n;return Object(c.a)(this,t),(n=Object(l.a)(this,Object(u.a)(t).call(this,e))).controller=void 0,n.controller=new ve(Object(m.a)(Object(m.a)(n))),n.state={episodes:[],selectedScene:0},he(new te(new ze([]))),n}return Object(h.a)(t,e),Object(o.a)(t,[{key:"componentDidMount",value:function(){document.addEventListener("keydown",this.controller.handleKeyDown)}},{key:"componentWillUnmount",value:function(){this.controller.destroy()}},{key:"render",value:function(){return i.a.createElement("div",{className:"box",style:{minWidth:140}},this.getEpisodes())}},{key:"getHighlight",value:function(e,t){return t===this.state.selectedScene?i.a.createElement("mark",null,e):e}},{key:"getEpisodes",value:function(){var e=this,t=[],n=-1,a=0;return this.state.episodes.forEach(function(r){var s=++n;t.push(i.a.createElement("b",{key:s,onClick:function(){e.controller.switchToScene(s)}},e.getHighlight(r.title,s))),t.push(i.a.createElement("br",{key:--a})),r.scenes.forEach(function(s){var c=++n;e.controller.getSelectedEpisode()===r.gameState.phase&&(t.push(i.a.createElement("a",{key:c,onClick:function(){return e.controller.switchToScene(c)}},e.getHighlight(s.title,c))),t.push(i.a.createElement("br",{key:--a})))})}),t}}]),t}(i.a.Component),Ae=function(e){function t(e){var n;return Object(c.a)(this,t),n=Object(l.a)(this,Object(u.a)(t).call(this,e)),e.controller.inject(Object(m.a)(Object(m.a)(n))),n}return Object(h.a)(t,e),Object(o.a)(t,[{key:"render",value:function(){return i.a.createElement("div",{className:"main-page"},i.a.createElement(re,null),i.a.createElement("div",{className:"columns"},i.a.createElement("div",{className:"column is-narrow"},i.a.createElement(Te,null)),i.a.createElement("div",{className:"column"},i.a.createElement(oe,null))))}}]),t}(i.a.Component),Fe=function(e){function t(){return Object(c.a)(this,t),Object(l.a)(this,Object(u.a)(t).apply(this,arguments))}return Object(h.a)(t,e),Object(o.a)(t,[{key:"render",value:function(){return i.a.createElement(Ae,{controller:new S})}}]),t}(a.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));s.a.render(i.a.createElement(Fe,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})},64:function(e,t,n){e.exports=n(165)},69:function(e,t,n){},73:function(e,t,n){},78:function(e,t,n){}},[[64,1,2]]]);
//# sourceMappingURL=main.2f988995.chunk.js.map