//--- FOR DEBUG ------------------------

var debugflag = 0;

function dbgstring(sss){
  document.getElementById("dbgstr").innerHTML = sss;
}

//--------------------------------------

var pconf;
//=== MainFlow =======
window.onload = function(){

  // 起動時：リソースロード
  pconf = new rootObj(4);
  pconf.cvs = document.getElementById( "cv1" );
  pconf.ctx = pconf.cvs.getContext("2d");
  //読み込み時：サイズの設定
  window_load(pconf);
  // 起動時：禁止のセット
  SetPreventFunction(pconf);

  var gfps = 30;//60;
  var gwt = 1000/gfps;
  pconf.gwt = gwt;

  //=== メイン ===
  mainfunc(pconf);
  console.log("window.onload invoke");
}

function mainfunc(ppp){
  console.log("mainfunc invoke");
  // ------------------------------------------------------------
  // 一定時間隔で、繰り返し実行される関数
  // ------------------------------------------------------------
  // 引数は、１にコールバック、２にタイマー、３以降は実装依存
  // https://qiita.com/kouhe1/items/9c23604901039832d385
  setInterval(mainloopfunc, ppp.gwt, ppp);
}

function mainloopfunc(ppp){
  //console.log("mainloopfunc invoke");
  ppp.draw();
}

function window_load(ppp) {
  //var sW,sH,s;
  var sW = (window.innerWidth > 600) ? 600 : 400;
  var sH = sW;
  // HTML 上に表示
  var s = "ウィンドウサイズ：横幅 = " + sW + " / 高さ = " + sH;
  document.getElementById("winsize2").innerHTML = s;
  // キャンバスサイズ
  ppp.cvs.setAttribute( "width" ,  sW );
  ppp.cvs.setAttribute( "height" , sH );
  ppp.ctx.width  = sW;
  ppp.ctx.height = sH;
}

//==============================================================================
// Control Related
//==============================================================================
function SetPreventFunction(ppp) {
    // PCでのスクロール禁止
    document.addEventListener("mousewheel", scroll_control, { passive: false });
    // スマホでのタッチ操作でのスクロール禁止
    ppp.cvs.addEventListener("touchstart", funcss, { passive: false });
    ppp.cvs.addEventListener("touchmove",  funccc, { passive: false });
    ppp.cvs.addEventListener("touchend",   funcee, { passive: false });
    // タッチ操作での拡大縮小禁止
    document.addEventListener("touchmove", mobile_no_scroll, { passive: false });
    // マウス移動も可能に
    ppp.cvs.addEventListener("mousedown", mmmfuncss, { passive: false });
    ppp.cvs.addEventListener("mousemove", mmmfunccc, { passive: false });
    ppp.cvs.addEventListener("mouseup",   mmmfuncee, { passive: false });
    // マウス移動、範囲外で停止
    document.body.addEventListener("mouseout", funcee, { passive: false });
}

//--- タッチ操作 ---
function funcss(event) {
//dbgstring("Invoke ss");
  ctrStart(event,event.changedTouches[0].clientX,event.changedTouches[0].clientY);
}
function funccc(event) {
//dbgstring("Invoke mv");
  ctrMove2(event, event.changedTouches[0].clientX,event.changedTouches[0].clientY);
}
function funcee(event) {
  ctrReset(event);
}
//--- マウス操作 ---
// https://developer.mozilla.org/ja/docs/Web/API/Element/mousemove_event
function mmmfuncss(event) {
  ctrStart(event,event.offsetX,event.offsetY);
}
function mmmfunccc(event) {
  ctrMove(event, event.offsetX,event.offsetY);
}
function mmmfuncee(event) {
  ctrEnd(event,  event.offsetX,event.offsetY);
}

// スクロール関連メソッド
function scroll_control(event) {
  event.preventDefault();
}
// 拡大縮小禁止
function mobile_no_scroll(event) {
  // ２本指での操作の場合
  if (event.touches.length >= 2) {
    // デフォルトの動作をさせない
    event.preventDefault();
  }
}
//----------------------------------------------------------
// Customized
//----------------------------------------------------------
var flag = 0;
var px = -1;
var py = -1;
function ctrStart(event,xx,yy){
  event.preventDefault();
  flag = 1;
  px = xx;
  py = yy;
  //console.log("flag = 1");
}
function ctrMove(event,xx,yy){
  event.preventDefault();
}
function ctrMove2(event,xx,yy){
  event.preventDefault();
  if(flag == 1){
    let rtn = mvfunc(xx-px,yy-py);
    if(rtn != 0){
      flag = 0;
    }
  }
}
function ctrReset(){
  console.log("ctrReset");
  flag = 0;
  px = -1;
  py = -1;
}
function ctrEnd(event,xx,yy){
  event.preventDefault();
  if(flag == 1){
    mvfunc(xx-px,yy-py);
  }
  flag = 0;
  px = -1;
  py = -1;
  //console.log("flag = 0");
}

function mvfunc(lx,ly){
  let ddd = 0;
  //console.log("lx:ly = "+lx+":"+ly);
  let vx = Math.abs(lx);
  let vy = Math.abs(ly);
  if(vx > vy + 50){
    ddd = (lx > 0) ? 3 : 2; // "Right", "Left"
  }else if(vy > vx + 50){
    ddd = (ly > 0) ? 1 : 4; // "Down", "Up"
  }else{
    ddd = 0;
    return 0;
  }
  pconf.move(ddd);
  return ddd;
}

//==============================================================================
// Game Main Control Related
//==============================================================================
class rootObj {
  constructor(nnn){
    this.nnn = nnn;
    this.tbl = new Array(nnn*nnn).fill(0);;
    dbgstring("Init");
    this.addnum();    // 最初の一つ
    this.newobj = 0;  // 出てきたところ
    this.powobj = []; // 合成したところ
  }
  draw(){
    var ctx = this.ctx;
    ctx.beginPath();
    //--- BackGroundColor ---
    ctx.fillStyle = 'rgb( 0, 0, 0)';
    ctx.fillRect(0, 0, ctx.width, ctx.height);
    //--- cell ---
    let mg = 5; // margin
    let lll = ctx.width/this.nnn;
    for(let j=0; j < this.nnn;j++){
      let yy = j*lll;
    for(let i=0; i < this.nnn;i++){
      let xx = i*lll;
      //=== 二重ループの必要ないけど、二重ループのほうが楽かぁぁ ===
      let ii = this.nnn*j+i;
      // cell draw
      ctx.beginPath();
      ctx.strokeStyle = 'rgb( 128, 128, 255)';
      ctx.strokeRect(xx+mg, yy+mg, lll-2*mg, lll-2*mg);
      // cell text
      let val = this.tbl[ii];
      //=== change Yellow ===
      let ccflag = 0;
      for(let k=0;k<this.powobj.length;k++){
        if(ii == this.powobj[k]){
          ccflag = 1;
          break;
        }
      }
      if(val != 0){
        ctx.font = (lll > 100) ? "100px sans-serif" : "80px sans-serif";
        if(ccflag){
          ctx.fillStyle = 'rgb( 255, 255, 128)';
        }else if(this.newobj == j*this.nnn+i){
          ctx.fillStyle = 'rgb( 128, 255, 255)';
        }else{
          ctx.fillStyle = 'rgb( 128, 128, 255)';
        }
        if(lll > 100){
          ctx.fillText(val, xx+45, yy+110);
        }else{
          ctx.fillText(val, xx+30, yy+80);
        }
      }
    }}
  }

  move(ddd){
    let dec = ["None","Down","Left","Right","Up"];
    //console.log("Dec:"+dec[ddd]);
    dbgstring("Invoke move "+dec[ddd]);
    if(ddd == 0){
      return;
    }
    //=== 初期化 (変更なくても初期化しておく) ===
    this.powobj = [];
    //=== テーブルの変換 ===
    let rtn = tblconvert(ddd, this.tbl);
    //=== 変更なければ以降何もしない ===
    if(rtn == 0){return;}
    //=== 新規追加 ===
    this.addnum();
    //=== 色を変えるため(100以上なら黄色に) ===
    for(let i=0;i<16;i++){
      if(this.tbl[i] > 100){
        this.tbl[i] -= 100;
        this.powobj.push(i);
      }
    }

  } // move()

  addnum(){
    var aaa = getRandArray();
    let nnn = aaa.length;
    console.log("nnn is "+nnn);
    for(let i=0;i<nnn;i++){
      let ii = aaa[i];
      if(this.tbl[ii] == 0){
        this.tbl[ii] = 1;
        this.newobj = ii;
        break;
      }
    }
  }

} //=== class rootObj ===

function cvt(aaa){
  let nnn = aaa.length; // 4
  let bbb = [];
  //=== ０を無視して数字を前に詰める ===
  // aaa:[1,0,2,3] => bbb:[1,2,3]
  for(let i=0;i<nnn;i++){
    if(aaa[i] != 0){
      bbb.push(aaa[i]);
    }
  }
  //=== 合成 しながら詰めなおす ========
  // bbb:[1,1,2,2] => aaa:[2,3,X,X]
  let cur = 0;
  for(let i=0;i<bbb.length;i++){
    if(bbb[i] == bbb[i+1]){ // bbb[i+1] が undefined でも、NOT equal なのでまあ動く。
      aaa[cur++] = bbb[i]+1+100; // 合成で＋１、色を変えるため100を加算 
      i++;
    }else{
      aaa[cur++] = bbb[i];
    }
  }
  //=== 残りをゼロ埋め =================
  // aaa:[2,3,X,X] => aaa:[2,3,0,0]
  for(let i=cur;i<nnn;i++){
    aaa[i] = 0;
  }
}

//＝＝＝ 本当はInit関数でプログラムで生成したい ＝＝＝
var mzz = [
  [[12,8,4,0],[13,9,5,1],[14,10,6,2],[15,11,7,3]], // "Down"
  [[0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15]], // "Left"
  [[3,2,1,0],[7,6,5,4],[11,10,9,8],[15,14,13,12]], // "Right"
  [[0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15]]  // "Up"
];
function tblconvert(ddd, aaa){
  if(ddd == 0){return 0;}
  let cflag = 0; // 更新したかどうか
  for(let i=0;i<4;i++){
    let mmm = mzz[ddd-1][i];
    let xxx = [aaa[mmm[0]],aaa[mmm[1]],aaa[mmm[2]],aaa[mmm[3]]];
    cvt(xxx);
    for(let j=0;j<4;j++){
      if(aaa[mmm[j]] != xxx[j]){
        aaa[mmm[j]] = xxx[j];
        cflag = 1; // 一度でも更新していれば
      }
    }
  }
  return cflag;
}

// 配列のシャッフル: Fisher-Yates アルゴリズム
// https://ja.javascript.info/task/shuffle
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
function getRandArray(aaa){
  let arr = new Array(0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15);
  shuffle(arr);
  return arr;
}
