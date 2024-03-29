// Canvas Variables
var canvas = document.getElementById('gameCanvas');
canvas.focus();
var ctx = canvas.getContext("2d");

// Plant Data
const plantIDs = {
    corn: createPlant('Corn', 25, 25, 1, 8, 30, 6, 5, 'https://sdg-ebenezer.github.io/farm-game/Pictures/Corn%20Texture/pixil-frame-0.png', '#ad9655', '#fcba03'),
    potato: createPlant('Potato', 5, 5, 1, 7, 5, 4, 1, 'https://sdg-ebenezer.github.io/farm-game/Pictures/Potato%20Texture/pixil-frame-0.png', '#5f8a50', '#34ab09'),
    carrot: createPlant('Carrot', 15, 15, 1, 7, 15, 2, 3, 'https://sdg-ebenezer.github.io/farm-game/Pictures/Carrot%20Texture/pixil-frame-0.png', '#dba55a', '#e68702')
};

// Function to create a plant object
function createPlant(name, profit, cost, qty, status, gTime, maxYield, minYield, mainImgSrc, offColor, onColor) {
    return {
        name: name,
        profit: profit,
        cost: cost,
        qty: qty,
        status: status,
        gTime: gTime,
        maxYield: maxYield,
        minYield: minYield,
        mainImgSrc: mainImgSrc,
        offColor: offColor,
        onColor: onColor
    };
}

var fps = 10
var gameTickTime = 1000 //ms
var gameTick = 0 //
var money = 1000 //

canvas.height = window.innerHeight
canvas.width = window.innerWidth

var iconSize = (canvas.width > canvas.height) ? canvas.height/15 : canvas.width/15
var menuWidth = canvas.height/5
var optionSize = menuWidth - 25

var selectedCrop, marketBtnW, marketBtnH, marketBtnX, marketBtnY, helpBtnW, helpBtnH, helpBtnX,
helpBtnY, inputw, inputh, inputx, inputy, inputTextSize, maxBuyHeight, cfbw, cfbh, cfbx, cfby, 
bsBtnX, bsBtnY, bsBtnW, bsBtnH, historyBtnX, historyBtnY, menuTextSize, widthMinus, landNum, landPerRow, 
landSize, displayH, displayW, displayX, displayY, displayBtnH, displayBtnW, displayBtnX, 
displayBtnY, historyBtnW, historyBtnH, buyOptionSize

//misc vars contained in here
function stateVars(){
    iconSize = (canvas.width > canvas.height) ? canvas.height/15 : canvas.width/15

    menuWidth = (canvas.width > canvas.height) ? canvas.height/5 : canvas.width/5
    optionSize = menuWidth - 25

    marketBtnW = marketBtnH = iconSize
    marketBtnX = canvas.width - iconSize
    marketBtnY = canvas.height - iconSize

    helpBtnW = helpBtnH = iconSize
    helpBtnX = canvas.width - helpBtnW
    helpBtnY = canvas.height - (helpBtnH * 2)

    inputw = canvas.width * 2/7 //
    inputh = canvas.height/20 //
    inputx = canvas.width * 1/75
    inputy = optionSize * (Object.keys(plantIDs).length + 2) //
    inputTextSize = (inputh > 10)? inputh : 10

    cfbw = cfbh = iconSize
    cfbx = canvas.width - cfbw
    cfby = canvas.height - (cfbh * 3)
	
	bsBtnH = iconSize
	bsBtnW = bsBtnH * 2
    bsBtnX = canvas.width - iconSize - bsBtnW
    bsBtnY = canvas.height - bsBtnH

    historyBtnX = canvas.width - historyBtnW
    historyBtnY = canvas.height - (historyBtnH * 3)

    menuTextSize = menuWidth
    
    widthMinus = canvas.width - menuWidth
    landNum = 64
    landPerRow = Math.sqrt(landNum)// each square is 1/<landPerRow> of the canvas size (e.g. if landPerRow is 20, then land size is 1/20)
    landSize = (widthMinus > canvas.height)? canvas.height/landPerRow : widthMinus/landPerRow

    displayH = (canvas.width > canvas.height) ? canvas.height/2 : canvas.width/2
    displayW = canvas.width/25
    displayX = canvas.width - displayW - displayH
    displayY = 0
    displayBtnH = (canvas.width > canvas.height) ? canvas.height * 2/35 : canvas.width * 2/35
    displayBtnW = displayH + displayW
    displayBtnX = displayX
    displayBtnY = displayY + displayH

    historyBtnW = historyBtnH = iconSize

    buyOptionSize = (canvas.width > canvas.height) ? canvas.height/8 : canvas.width/8
}
//default vars
var mouseActive = true
var market = false // t/f
var changeFarmPG = false //
var help = false

//input
var quantity = "1"
var active = false //

//
landStatus = ['uncleared', 'cleared', 'planted']
//
var currentDisplay = 0

//buy
var sellNBuy = true //T = SELL | F = BUY
//
var showLandId = false //

//farms
var farmNum = 1 //start out num
var currentFarm = 0
var farmBtnsScrollBase = 0

//history
const history = []
var hsty = false
var hstyScrollable = {
    up : false,
    down : false
}

/****GET RANDOM NUM */
function random(min, max){
    return Math.round(Math.random() * (max-min)) + min
}

/****LAND */
var currentLand = 0

//lists
farms = []
plantList = []
farmBtns = []
menuOptionList = []
sellBtnsList = []
buyList = []
displayList = []

//classes
class land{
    constructor(status, id){
        this.status = status 
        this.id = id

        this.size = landSize
        this.xcoordinator = Math.floor(this.id%landPerRow)
        this.ycoordinator = Math.floor((this.id)/landPerRow)// # row
        this.x = this.xcoordinator * this.size + menuWidth
        this.y = this.ycoordinator * this.size
        
        this.g = random(50,80)
        this.rgb = ''
        this.draw = ()=>{
            let extraLandPadding = (widthMinus > canvas.height)? canvas.height/800 : widthMinus/800
            if(this.status == 'uncleared'){
                this.rgb = `rgb(3, ${this.g}, 30)`
            }
            else if(this.status == 'cleared'){
                this.rgb = 'rgb(74, 55, 23)'
            }
            ctx.fillStyle = this.rgb
            ctx.fillRect(this.x, this.y, this.size + extraLandPadding, this.size + extraLandPadding)
            if(this.status == 'planted'){
                ctx.fillStyle = '#00000055'
                ctx.fillRect(this.x, this.y, this.size + extraLandPadding, this.size + extraLandPadding)
            }
            if(showLandId){
                ctx.fillStyle = '#aaaaaa'
                ctx.font = '20px Trebuchet MS'
                ctx.fillText(this.id, this.x, this.y + 20)
            }
        }
    }
}
class farmOrganizer{
    constructor(id){
        this.id = id
        this.landL = []
    }
}
class plant{
    constructor(landId, plantTime, id, plantedLand, cF){
        this.landId = landId
        this.id = id
        this.plantTime = plantTime + this.id.gTime
        
        this.cF = cF // current farm

        this.x = farms[this.cF].landL[this.landId].x
        this.y = farms[this.cF].landL[this.landId].y

        this.kind = this.id.name
        this.status = 1
        this.plantedLand = plantedLand


        this.draw = ()=>{
            let img = document.createElement('img')
            img.src = `https://sdg-ebenezer.github.io/farm-game/Pictures/${this.kind}%20Texture/pixil-frame-${this.status}.png`
            ctx.drawImage(img, this.x, this.y, landSize, landSize)
        }
    }
}
class menuOption{
    constructor(id, pId){
        this.id = id
        this.pId = pId
        this.imgSrc = this.pId.mainImgSrc
        this.x = 0
        this.y = optionSize * this.id
        this.w = optionSize
        this.h = optionSize 
        this.draw = ()=>{
            let img = document.createElement('img')
            img.src = this.imgSrc
            ctx.drawImage(img, this.x, this.y, this.w, this.h)
            if(this.pId == selectedCrop && this.pId.qty > 0){
                ctx.fillStyle = '#ffffff0e' 
                ctx.fillRect(this.x, this.y, this.w, this.h)
            }
            if(this.pId.qty <= 0){
                ctx.fillStyle = '#00000099' 
                ctx.fillRect(this.x, this.y, this.w, this.h)
            }
            ctx.fillStyle = 'white'
            ctx.font = `bold ${optionSize/4}px Trebuchet MS`
            ctx.fillText(pId.qty, this.x + this.w, this.y + this.h)
        }
    }
}
class farmBtn{
    constructor(x, y, w, h, par){
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.par = par
        this.draw = ()=>{
            let img = document.createElement('img')
            img.src = 'https://sdg-ebenezer.github.io/farm-game/Pictures/Farm.png'
            ctx.drawImage(img, this.x, this.y + farmBtnsScrollBase, this.w, this.h)
            //text
            ctx.fillStyle = 'white'
            ctx.font = '20px Trebuchet MS'
            ctx.fillText(`#${this.par.id + 1}`, this.x + this.w - 25, this.y + this.h + farmBtnsScrollBase, 25)
        }
    }
}
class sellBtn{
    constructor(par, btnID){
        this.par = par
        this.btnID = btnID
        this.crop = this.btnID.name
        this.x = menuWidth
        this.y = this.par.y
        this.w = displayX - this.x
        this.h = this.par.h
        this.color = '#222'
        this.draw = ()=>{   
            let fontPaddingW = 10   
            let fontPaddingH = this.h/2   
            ctx.fillStyle = this.color
            ctx.fillRect(this.x, this.y, this.w, this.h)
            if(this.par.id%2 != 0){
                ctx.fillStyle = '#ffffff22'
                ctx.fillRect(this.x, this.y, this.w, this.h)
            }
            let s = (parseInt(quantity) == 1) ? "" : "s"
            //FONT
            ctx.fillStyle = 'white'
            ctx.font = `bold ${(canvas.width > canvas.height) ? canvas.height/30 : canvas.width/30}px Trebuchet MS`
            ctx.fillText(`Sell x${(quantity == "") ? 0 : quantity} ${this.crop}${s}`, 
            this.x + fontPaddingW, this.y + fontPaddingH * 1.2, this.w - fontPaddingW)
            if(quantity > this.btnID.qty) this.color = '#cc0700'
            else{this.color = '#222'}
            
        }
    }
}
class buyOption{
    constructor(id, pId){
        this.id = id
        this.pId = pId

        this.imgSrc = pId.mainImgSrc
        this.size = buyOptionSize
        this.x = 0
        this.y = (this.size * this.id)
        this.drawMajorDisplay = ()=>{
            ctx.save()
            ctx.translate(this.x + this.size + 50, this.y)
            //background
            if(this.id%2 == 1) ctx.fillStyle = '#333'
            else{ctx.fillStyle = '#212121'}
            ctx.fillRect(0, 0, canvas.width, this.size)
            //image
            let img = document.createElement('img')
            img.src = this.imgSrc
            ctx.drawImage(img, 0, 0, this.size, this.size)
            //font
            let fontPaddingW = 10 + this.size  
            let fontPaddingH = this.size/2   
            ctx.fillStyle = '#eee'
            ctx.font = '20px Trebuchet MS'
            let s = (quantity != 1) ? "s" : ""
            ctx.fillText(`Buy x${(quantity == "") ? 0 : quantity} ${this.pId.name}${s} (Grand Cost: $${this.pId.cost * quantity})`, 
            fontPaddingW, fontPaddingH)
            ctx.restore()
        }
        this.draw = ()=>{
            let img = document.createElement('img')
            img.src = this.imgSrc
            ctx.drawImage(img, this.x, this.y, this.size, this.size)

            //text
            ctx.fillStyle = '#aaaaaa'
            ctx.font = '20px Trebuchet MS'
            ctx.fillText(`$${this.pId.cost}`, this.x + this.size, this.y + this.size, 50)
        }
    }
}
class display{
	constructor(id){
        this.id = id

    	this.offc = id.offColor
        this.onc = id.onColor
        this.min = id.minYield

        this.height = displayH
        this.width = (displayW < 75)? displayW : 75
        this.x = displayX
        this.y = displayY

        this.src = this.id.mainImgSrc
        this.max = this.id.profit

        this.cur = random(this.min, this.max)//current value
    	this.draw = ()=>{
            ctx.save()
            ctx.translate(this.x, this.y)
            ctx.fillStyle = '#212121'
            ctx.fillRect(this.width + displayY, displayY, 0, 0)
            //
            let imgSize = this.height
            let fontPadding = 10
            let fontSize = 20
            let textX = 0
            let textY = imgSize
            let img = document.createElement('img')
            img.src = this.src
            ctx.drawImage(img, 0, 0, imgSize, imgSize)
            //
            ctx.fillStyle = '#0000002e'
            ctx.fillRect(textX, textY, imgSize, -fontSize - fontPadding)
            ctx.fillStyle = 'white'
            ctx.font = `${fontSize}px Trebuchet MS`
            ctx.fillText(`Sell x1 for: $${this.cur}`, textX + fontPadding, textY - fontPadding)
            //
            ctx.fillStyle = `${this.offc}`
            ctx.fillRect(imgSize, this.height, this.width, -this.height)
            ctx.fillStyle = `${this.onc}`
            ctx.fillRect(imgSize, this.height, this.width, 
            (this.cur == this.min) ? -5 : -this.height * (this.cur - this.min)/(this.max - this.min))

            ctx.restore()
        }
    }
}

//functions
/****CROPS */
function timeCropGrowth(){    
    for(let i in plantList){
        let crop = plantList[i]
        if(gameTick >= crop.plantTime){
            crop.plantTime += crop.id.gTime
            if(crop.status < crop.id.status) crop.status += 1
        }
    }
}
function drawCrops(){
    for(let i in plantList){
        if(plantList[i].cF == currentFarm) plantList[i].draw()
    }
}
/****LAND/DRAW */
function background(){
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}
function generateLand(){ 
    //farm 
    for(let k = 0; k < farmNum; k ++){
        farms.push(new farmOrganizer(k))
        for(let j = 0; j < landNum; j++){
            let landChunkStatus = (random(1, 100) == 1) ? 'cleared' : 'uncleared'
            let landChunk = new land(landChunkStatus, j)
            farms[k].landL.push(landChunk)
        }
    }
    //farm btn
    for(let f = 0; f < farms.length; f++){
        farmListPush(f)
    }
}
function generateNewLand(){
    farms.push(new farmOrganizer(farms.length))
    //
    for(let j = 0; j < landNum; j++){
        var landChunk = new land((random(1, 100) == 1) ? 'cleared' : 'uncleared', j)
        farms[farms.length - 1].landL.push(landChunk)
    }
    farmListPush(farms.length - 1)
    farmNum += 1
}
function farmListPush(i){
    let w = h = canvas.width/10
    let row = 10 // # row
    let xcoordinator = i%row
    let ycoordinator = Math.floor(i/row)
    let x = xcoordinator * w
    let y = ycoordinator * h 
    farmBtns.push(new farmBtn(x, y, w, h, farms[i]))
}
function drawLand(){
    for(let z = 0; z < farms[currentFarm].landL.length; z++){
        farms[currentFarm].landL[z].draw()
    }
}
//land chance to turn back to uncleared if cleared
setInterval(()=>{
    for(let i in farms){
        for(let j in farms[i].landL){
            if(farms[i].landL[j].status == 'cleared'){
                let chance = random(1, 100)
                if(chance == 1){
                    farms[i].landL[j].status = 'uncleared'
                }
            }
        }
    }
}, gameTickTime)
//change farm btn
function chgFarmBtn(){
    let img = document.createElement('img')
    img.src = 'https://sdg-ebenezer.github.io/farm-game/Pictures/Farm.png'
    ctx.drawImage(img, cfbx, cfby, cfbw, cfbh)
    //
    let tSize = 20
    ctx.fillStyle = '#eee'
    ctx.font = '20px Trebuchet MS'
    ctx.fillText(`#${currentFarm + 1}`, canvas.width - tSize * 1.5, tSize)
}
function drawFarms(){
    ctx.fillStyle = '#00000099'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    for(let i in farmBtns){
        farmBtns[i].draw()
    }
}
/****MONEY */
function showMoney(){
    let fontSize = menuWidth/4
    let fontPadding = 10
    let rectH = fontSize + fontPadding * 2
    let rectX = 0
    let rectY = canvas.height - rectH
    //RECT
    ctx.fillStyle = '#000000aa'
    ctx.fillRect(rectX, rectY, menuWidth, rectH)
    //FONT
    ctx.fillStyle = 'white'
    ctx.font = `${fontSize}px Trebuchet MS`
    ctx.fillText(`$${money}`, rectX + fontPadding, rectY + fontPadding + fontSize, menuWidth)
}
/****MENU */
function menuBackground(){
    //Menu
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, menuWidth, canvas.height)
}
function drawMenuOptions(){
    for(let i in menuOptionList){
        let produce = menuOptionList[i]
        produce.draw()
    }
}
/****MARKET */
function marketContent(){
    //market bakground
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    showMoney()
    drawMInputDisplay()
    mInputDisplay()
    bsBtn()
    if(sellNBuy){
        for(let i in sellBtnsList){
            sellBtnsList[i].draw()
        }
        displayList[currentDisplay].draw()
        drawMenuOptions()
        displayBtn()
    }
    else{
        drawBuyDisplay()
    }
    //history
    if(hsty){
        historyF()
    }
    historyBtn()
}
//market/home btn
function drawMarketBtn(){
    let img = document.createElement('img')
    img.src = !market ? 'https://sdg-ebenezer.github.io/farm-game/Pictures/Market.png' : 'https://sdg-ebenezer.github.io/farm-game/Pictures/House.png'
    ctx.drawImage(img, marketBtnX, marketBtnY, marketBtnW, marketBtnH)
}
/**** INPUTS/ETC */
//quantity
function mInputDisplay(){
	var fontPadding = 2
	ctx.fillStyle = 'white'
    ctx.font = `${inputTextSize}px Trebuchet MS`
    ctx.fillText(`${quantity}`, inputx + fontPadding, inputy + inputh - fontPadding, inputw - fontPadding)
}
function type(num){
    if(active){
        quantity = quantity.concat(num)
    } 
    if(quantity.length > 5) quantity = quantity.slice(0, -1)
}
function drawMInputDisplay(){
    var fontPadding = 2
    ctx.fillStyle = 'white'
    ctx.font = `${inputTextSize * 2/3}px Trebuchet MS`
    ctx.fillText('Custom Quantity:', inputx + fontPadding, inputy - (fontPadding * 3), inputw - fontPadding)
    ctx.fillStyle = active?'#999':'#1f1f1f'
    ctx.fillRect(inputx, inputy, inputw, inputh)
    if(quantity === ''){
        ctx.fillStyle = '#3f3f3f'
        ctx.font = `${inputTextSize}px Trebuchet MS`
        ctx.fillText('AMOUNT', inputx + fontPadding, inputy + inputh - fontPadding, inputw - fontPadding)
    }
}
/****BUY */
function drawBuyDisplay(){
    for(let i in buyList){
        let bOption = buyList[i]
        bOption.drawMajorDisplay()
        bOption.draw()
    }
}
//next display
function displayBtn(){
    var textSize = displayBtnW/2

    ctx.fillStyle = '#555'
    ctx.fillRect(displayBtnX, displayBtnY, displayBtnW, displayBtnH)
    
    ctx.fillStyle = 'white'
    ctx.font = 'bold 20px Trebuchet MS'
    ctx.fillText('>> Next Demand >>', displayBtnX + displayBtnW/2 - textSize/2, displayBtnY + displayBtnH * 2/3, textSize)
}
//finds price to sell crops for/change this.cur in Display Class
setInterval(()=>{
    for(let i in displayList){
        let display = displayList[i]
        let chance = random(1, 2)
        if(chance == 1 && display.cur + 1 <= display.max){
            display.cur += 1
        }
        else if(chance == 2 && display.cur - 1 >= display.min){
            display.cur -= 1
        }
        else{
            display.cur += 0
        }
        display.id.profit = display.cur
    }
}, gameTickTime)
/**** BUY/SELL BTN */
function bsBtn() {
    let img = document.createElement('img');
    img.src = sellNBuy ? 'https://sdg-ebenezer.github.io/farm-game/Pictures/Buy.png' : 'https://sdg-ebenezer.github.io/farm-game/Pictures/Sell.png';
    ctx.drawImage(img, bsBtnX, bsBtnY, bsBtnW, bsBtnH);
}

/**** HELP BTN */
function helpF(){
    //background
    ctx.fillStyle = '#00000099'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}
function helpBtn(){
    let img = document.createElement('img')
    img.src = 'https://sdg-ebenezer.github.io/farm-game/Pictures/Help.png'
    ctx.drawImage(img, helpBtnX, helpBtnY, helpBtnW, helpBtnH)
}
/**** HISTORY BTN */
function historyF(){
    //text
    let titleTextSize = 30
    let textSize = 20
    let textPadding = 20
    let textSpacing = 1.5
    let historyBackgroundColor = '#000000ce'

    //background
    ctx.fillStyle = historyBackgroundColor
    ctx.fillRect(0, titleTextSize + textPadding, canvas.width, canvas.height)

    ctx.save()
    ctx.translate(0, titleTextSize + textPadding * 2.5)

    ctx.fillStyle = '#eee'
    ctx.font = `${textSize}px Trebuchet MS`
    for(let i in history){
        ctx.fillText(`${history[i][0]}`, textPadding, textSize * history[i][1] * textSpacing)
    }
    
    ctx.restore()

    ctx.fillStyle = historyBackgroundColor
    ctx.fillRect(0, 0, canvas.width, titleTextSize + textPadding)
    ctx.fillStyle = 'white'
    ctx.font = `bold ${titleTextSize}px Trebuchet MS`
    ctx.fillText('Transaction History:', textPadding, titleTextSize + textPadding/2)
    

}
function historyBtn(){
    let img = document.createElement('img')
    img.src = 'https://sdg-ebenezer.github.io/farm-game/Pictures/History.png'
    ctx.drawImage(img, historyBtnX, historyBtnY, historyBtnW, historyBtnH)
}
//
function plantCrop(Sland){
    for(let i = 0; i < Object.keys(plantIDs).length; i++){
        let Splant = Object.values(plantIDs)[i]
        if(selectedCrop.name == Splant.name && Splant.qty > 0){
            Splant.qty -= 1
            var Pland
            for(const j of farms[currentFarm].landL.values()){if(j == Sland.x, Sland.y) Pland = j}
            plantList.push(new plant(Sland.id, gameTick, Object.values(plantIDs)[i], Pland, currentFarm))
            Sland.status = landStatus[2]
        }
    }
}
//
function cursor(x, y){
    let w = h = (canvas.width > canvas.height)? canvas.height/30: canvas.width/30
    let img = document.createElement('img')
    img.src = ((selectedCrop!=null)? selectedCrop.qty : -1 > 0) && !market && !help?`https://sdg-ebenezer.github.io/farm-game/Pictures/Cursor/${selectedCrop.name}.png`:img.src = `https://sdg-ebenezer.github.io/farm-game/Pictures/Cursor/Crosshair.png`
    ctx.drawImage(img, x - w/2, y - h/2, w, h)
}
function checkClick(x, y, w, h, mx, my){
    if(mx >= x && mx <= x + w && my >= y && my <= y + h) return true
}
function resizeObjects() {
    stateVars();
    menuOptionList.forEach((menu, i) => {
        menu.x = 0;
        menu.y = optionSize * menu.id;
        menu.w = optionSize;
        menu.h = optionSize;
    });
    sellBtnsList.forEach((sBtn, i) => {
        sBtn.x = menuWidth;
        sBtn.y = sBtn.par.y;
        sBtn.w = displayX - sBtn.x;
        sBtn.h = sBtn.par.h;
    });
    buyList.forEach((bl, i) => {
        bl.size = buyOptionSize;
        bl.y = bl.id * bl.size;
    });
    displayList.forEach((d, i) => {
        d.height = displayH;
        d.width = (displayW < 75) ? displayW : 75;
        d.x = displayX;
        d.y = displayY;
    });
    farms.forEach((farm, i) => {
        farm.landL.forEach((land, j) => {
            land.size = landSize;
            land.xcoordinator = Math.floor(land.id % landPerRow);
            land.ycoordinator = Math.floor((land.id) / landPerRow); // # row
            land.x = land.xcoordinator * land.size + menuWidth;
            land.y = land.ycoordinator * land.size;
        });
    });
    plantList.forEach((p, i) => {
        farms.forEach((farm, j) => {
            farm.landL.forEach((land, k) => {
                p.x = farms[p.cF].landL[p.landId].x;
                p.y = farms[p.cF].landL[p.landId].y;
            });
        });
    });
    farmBtns.forEach((btn, i) => {
        let row = 10; // # row
        let xcoordinator = i % row;
        let ycoordinator = Math.floor(i / row);
        btn.w = btn.h = canvas.width / 10;
        btn.x = xcoordinator * btn.w;
        btn.y = ycoordinator * btn.h;
    });
}

/**** EVENT HANDLER */
const otherKeys = {
    shift : false,
}
window.onkeydown = (e)=>{
    //OTHER
    if(active){
        switch(e.key){
            case '1':
                type(1)
                break
            case '2':
                type(2)
                break
            case '3':
                type(3)
                break
            case '4':
                type(4)
                break
            case '5':
                type(5)
                break
            case '6':
                type(6)
                break
            case '7':
                type(7)
                break
            case '8':
                type(8)
                break
            case '9':
                type(9)
                break
            case '0':
                type(0)
                break
            case 'Backspace':
                  quantity = quantity.slice(0, -1)
                break
        }
    }
    //SHIFT
    switch(e.key){
	    case 'Shift':
		otherKeys.shift = true
    }
}
window.onkeyup = (e)=>{
    switch(e.key){
	    case 'Shift':
    		otherKeys.shift = false
    }
}

var cursorX = 0
var cursorY = 0
canvas.onmousemove = (e)=>{
    cursorX = e.x
    cursorY = e.y
}
canvas.onwheel = (e)=>{
    let scrollValue = (e.deltaY > 0)? -1 : 1
    
    if(history.length > 0){
        hstyScrollable.up = history[0][1] >= 0?false:true
        hstyScrollable.down = history[history.length-1][1] <= 0?false:true
    }
    
    if(hsty){
        if(scrollValue > 0 && hstyScrollable.up || (scrollValue < 0 && hstyScrollable.down)){
            for(let i in history){
                history[i][1] += scrollValue
            }
        }
    }
    if(changeFarmPG){
        farmBtnsScrollBase += scrollValue * 30
    }
}
canvas.ontouch = canvas.onmousedown = (e)=>{
    if(!help){
        /*** NOT MARKET **/
        if(!market){
            if(!changeFarmPG){
                for(let i in farms[currentFarm].landL){
                    let Sland = farms[currentFarm].landL[i]
                    if(checkClick(Sland.x, Sland.y, Sland.size, Sland.size, e.x, e.y)){
                        //clear land
                        if(Sland.status == landStatus[0] && money - 100 >= 0){
                            if(otherKeys.shift){
                                for(var j in farms[currentFarm].landL){
                                    Sland = farms[currentFarm].landL[j]
                                    if(money - 100 >= 0 && Sland.status == 'uncleared'){
                                        Sland.status = landStatus[1]
                                        money -= 100
                                    }
                                }
                            }
                            else{
                                Sland.status = landStatus[1]
                                money -= 100
                                Sland.g = random(50,80)
                            }
                        }
                        //plant
                        else if(Sland.status == landStatus[1] && selectedCrop != null){
                            if(otherKeys.shift){
                                for(var j in farms[currentFarm].landL){
                                    Sland = farms[currentFarm].landL[j]
                                    if(selectedCrop.qty > 0 && Sland.status == 'cleared'){
                                        plantCrop(Sland)
                                    }
                                }
                            }
                            else{
                                plantCrop(Sland)
                            }
                            
                        }
                        //harvest
                        else if(Sland.status == landStatus[2]){
                            let checkCrop
                            for(let i in plantList){ //
                                let c = plantList[i]
                                if(c.x == Sland.x && c.y == Sland.y && c.cF == currentFarm) checkCrop = c
                            } 
                            //
                            if(otherKeys.shift){
                                for(let cropCC = 0; cropCC < plantList.length;){ //
                                    let crop = plantList[cropCC]
                                    if(checkCrop.kind == crop.kind && crop.cF == currentFarm){
                                        //Get yield
                                        if(checkCrop.status == checkCrop.id.status) checkCrop.id.qty += checkCrop.id.maxYield
                                        else if(checkCrop.status == checkCrop.id.status - 1) checkCrop.id.qty += checkCrop.id.minYield
                                        //1% chance of regrowing
                                        if(random(1, 100) == 1){
                                            checkCrop.status = 1
                                            checkCrop.id.qty += checkCrop.id.maxYield
                                        }
                                        //
                                        else{
                                            //find land
                                            for(const Sland of farms[currentFarm].landL.values()){
                                                if(Sland.x == crop.x && Sland.y == crop.y) Sland.status = (random(1, 100) <= 99) ? 'cleared' : 'uncleared' //1% chance of uncleared
                                            }
                                            plantList.splice(cropCC, 1)
                                        }
                                    }
                                    else{cropCC++}
                                }
                            }
                            else{
                                if(checkCrop.cF == currentFarm){ //
                                    //Get yield
                                    if(checkCrop.status == checkCrop.id.status) checkCrop.id.qty += checkCrop.id.maxYield
                                    else if(checkCrop.status == checkCrop.id.status - 1) checkCrop.id.qty += checkCrop.id.minYield
                                    //1% chance of regrowing
                                    if(random(1, 100) == 1){
                                        checkCrop.status = 1
                                        checkCrop.id.qty += checkCrop.id.maxYield
                                    }
                                    //
                                    else{
                                        //find land
                                        Sland.status = (random(1, 100) <= 99) ? 'cleared' : 'uncleared' //1% chance of uncleared
                                        for(var z in plantList){
                                            if(plantList[z] == checkCrop) plantList.splice(z, 1)
                                        }
                                    }
                                }
                            }
                        }
                    }  
                }
                //  
                for(let i in menuOptionList){
                    let option = menuOptionList[i]
                    if(checkClick(option.x, option.y, option.w, option.h, e.x, e.y)){
                        selectedCrop = option.pId
                    }
                }
            }
            //change farm button
            if(checkClick(cfbx, cfby, cfbw, cfbh, e.x, e.y)){
                if(changeFarmPG) changeFarmPG = false
                else if(!changeFarmPG) changeFarmPG = true
            }
            //change farm
            if(changeFarmPG){
                for(let i in farmBtns){
                    let btn = farmBtns[i]
                    if(checkClick(btn.x, btn.y, btn.w, btn.h, e.x, e.y)){
                        currentFarm = btn.par.id
                        changeFarmPG = false
                    }
                }  
            }
        }
        /*** MARKET **/
        else if(market){
            if(quantity == "" || quantity == 0) quantity = 1
            //if history = true, disable the following
            if(!hsty){
                if(sellNBuy){
                    for(let i in sellBtnsList){
                        let btn = sellBtnsList[i]
                        if(checkClick(btn.x, btn.y, btn.w, btn.h, e.x, e.y) && btn.btnID.qty > 0 && parseInt(quantity) != 0){
                            if(parseInt(quantity) <= btn.btnID.qty){
                                money += btn.btnID.profit * parseInt(quantity) ?? 1
                                btn.btnID.qty -= parseInt(quantity)
                            }
                            history.push([`T${gameTick} || Sold x${quantity} ${btn.par.pId.name} for $${btn.btnID.profit * quantity}.`, 
                                        (history.length > 0)? history[history.length - 1][1] + 1 : 0])
                        }
                    }
                }
                else{
                    for(let i in buyList){
                        let btn = buyList[i]
                        if(checkClick(0, btn.y, canvas.width, btn.size, e.x, e.y) && money - (btn.pId.cost  * quantity) >= 0 && parseInt(quantity) != 0){
                            
                            btn.pId.qty += parseInt(quantity)
                            money -= btn.pId.cost * quantity
                            if(btn.pId.name == 'Farm'){
                                for(let j = 0; j < parseInt(quantity); j++){
                                    generateNewLand()
                                }
                            }
                            history.push([`T${gameTick} || Bought x${quantity} ${btn.pId.name} for $${btn.pId.cost * quantity}.`, 
                                    (history.length > 0)? history[history.length - 1][1] + 1 : 0])
                        }
                    }
                }
                //Display
                for(let i in menuOptionList){
                    let option = menuOptionList[i]
                    if(checkClick(option.x, option.y, option.w, option.h, e.x, e.y)){
                        selectedCrop = option.pId
                        //change display in market based on menu select
                        for(let i in displayList){
                            if(displayList[i].id == selectedCrop) currentDisplay = parseInt(i)
                        } 
                    }
                }
                //input
                if(checkClick(inputx, inputy, inputw, inputh, e.x, e.y)){
                    quantity = ''
                    active = true
                }
                else{
                    active = false
                }
                //Display, as in the big image and the current profit amount
                if(checkClick(displayBtnX, displayBtnY, displayBtnW, displayBtnH, e.x, e.y)){
                    currentDisplay += 1
                    if(currentDisplay >= displayList.length) currentDisplay = 0
                }
                //sell/buy btn
                if(checkClick(bsBtnX, bsBtnY, bsBtnW, bsBtnH, e.x, e.y) && market){
                    if(sellNBuy) sellNBuy = false
                    else if(sellNBuy == false) sellNBuy = true
                }
            }
            //history btn
            if(checkClick(historyBtnX, historyBtnY, historyBtnW, historyBtnH, e.x, e.y) && market){
                if(hsty) hsty = false
                else{hsty = true}
            }
            else{hsty = false}
        }
        //market btn
        if(checkClick(marketBtnX, marketBtnY, marketBtnW, marketBtnH, e.x, e.y)){
            if(market) market = false
            else market = true
        }
    }
    //help btn
    if(checkClick(helpBtnX, helpBtnY, helpBtnW, helpBtnH, e.x, e.y)){
        if(help) help = false
        else{help = true}
    }
    else{help = false}    
}

function startGame() {
    stateVars();
    generateLand();
    let plantValues = Object.values(plantIDs);
    for(let i = 0; i < plantValues.length; i++){
        menuOptionList.push(new menuOption(i, plantValues[i]));
        sellBtnsList.push(new sellBtn(menuOptionList[i], plantValues[i])); // corn
        buyList.push(new buyOption(i, plantValues[i]));
        displayList.push(new display(plantValues[i]));
    }
    buyList.push(new buyOption(buyList.length, {
        name : 'Farm',
        cost : 10000,   
        qty : farmNum,
        mainImgSrc : 'https://sdg-ebenezer.github.io/farm-game/Pictures/Farm.png',
    }));
}

startGame()
setInterval(function(){
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    resizeObjects()
    if(!market){
        //
        background()
        //
        menuBackground() 
        drawLand()
        drawCrops()
        showMoney()
        drawMenuOptions()
        if(changeFarmPG){
            drawFarms()
        }
        //
        chgFarmBtn()
    }
    else {
        marketContent()
    }
    
    drawMarketBtn() //
    helpBtn()

    //help
    if(help){
        helpF()
    }

    timeCropGrowth() // crop growth
    cursor(cursorX, cursorY)
}, 1000/fps)
/****GAME TICK */
setInterval(()=>{
    gameTick += 1
}, gameTickTime)
