/****CANVAS VARS/ETC. */
var canvas = document.getElementById('gameCanvas')
canvas.focus()
ctx = canvas.getContext("2d")

/****PLANT */
const plantIDs = {
    corn : {
        name : 'Corn',
        profit : 25,
        cost : 25, 
        qty : 1,
        status : 8,
        gTime : 30,
        maxYield : 6,
        minYield : 5,
        mainImgSrc : 'https://sdg-ebenezer.github.io/farm-game/Pictures/Corn%20Texture/pixil-frame-0.png', 
        offColor : '#ad9655', 
        onColor : '#fcba03', 
    },
    potato : {
        name : 'Potato',
        profit : 5,
        cost : 5,  
        qty : 1,
        status : 7,
        gTime : 5,
        maxYield : 4,
        minYield : 1,
        mainImgSrc : 'https://sdg-ebenezer.github.io/farm-game/Pictures/Potato%20Texture/pixil-frame-0.png', 
        offColor : '#5f8a50', 
        onColor : '#34ab09', 
    },
    carrot : {
        name : 'Carrot',
        profit : 15,
        cost : 15,   
        qty : 1,
        status : 7,
        gTime : 15,
        maxYield : 2,
        minYield : 3,
        mainImgSrc : 'https://sdg-ebenezer.github.io/farm-game/Pictures/Carrot%20Texture/pixil-frame-0.png',
        offColor : '#dba55a', 
        onColor : '#e68702',
    },  
}

var fps = 10
var gameTickTime = 1000 //ms

canvas.height = window.innerHeight
canvas.width = window.innerWidth
//
var iconSize = (! canvas.height/10 > 40) ? canvas.height/10 : 40
//
var gameTick = 0 //

var money = 1000 //

//menu
var menuWidth = canvas.height/5
var optionSize = menuWidth - 25

var mouseActive = true
var selectedCrop
//market
var market = false // t/f
var marketBtnX = canvas.width - iconSize
var marketBtnY = canvas.height - iconSize
var marketBtnW = marketBtnH = iconSize
//
var changeFarmPG = false //
//help
var help = false
var helpBtnW = helpBtnH = iconSize
var helpBtnX = canvas.width - helpBtnW
var helpBtnY = canvas.height - (helpBtnH * 2)
//
cursorStatusOptions = ['clear', 'plant', 'harvest']
cursorStatus = cursorStatusOptions[1]
//input
var quantity = "1"
var active = false //

var inputw = canvas.width * 2/7 //
var inputh = canvas.height/20 //
var inputx = canvas.height * 1/80 //
var inputy = optionSize * (Object.keys(plantIDs).length + 2) //

var inputTextSize = inputh

//
landStatus = ['uncleared', 'cleared', 'planted']
//
var currentDisplay = 0
//DISPLAY
var displayPadding = 10
var displayH = canvas.height/2
var displayW = canvas.width/25
var displayX = (menuWidth * 2) + (displayPadding * 2)
var displayY = displayPadding
//btn
var displayBtnH = 40
var displayBtnW = displayH + displayW
var displayBtnX = displayX
var displayBtnY = displayY + displayH
//change farm
var cfbw = cfbh = iconSize
var cfbx = canvas.width - cfbw
var cfby = canvas.height - (cfbh * 3)
//buy
var buyBtnY = canvas.height * 32/70
var maxBuyHeight = canvas.height - buyBtnY - inputy
var sellNBuy = true //
var bsBtnW = bsBtnH = iconSize
var bsBtnX = canvas.width - iconSize - bsBtnW
var bsBtnY = canvas.height - bsBtnH

//land
var landNum = 64
var landPerLine = 8// each square is 1/<landPerLine> of the canvas size (e.g. if landPerLine is 20, then land size is 1/20)
var landSize = (canvas.height > canvas.width) ? canvas.width/landPerLine : canvas.height/landPerLine
var landX = menuWidth
var landY = 0
//
var showLandId = false //

//farms
var farmNum = 1 //start out num
var currentFarm = 0

//history
const history = []
var hsty = false
var hstyScrollable = {
    up : false,
    down : false
}
var historyBtnW = historyBtnH = iconSize
var historyBtnX = canvas.width - historyBtnW
var historyBtnY = canvas.height - (historyBtnH * 3)

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
buyBtnsList = []
displayList = []

//classes
class land{
    constructor(x, y, status, id){
        this.size = landSize
        this.x = x
        this.y = y
        this.g = random(50,80)
        this.status = status 
        this.id = id
        this.rgb = 'rgb(0,0,0)'
        this.draw = ()=>{
            if(this.status == 'uncleared'){
                this.rgb = `rgb(3, ${this.g}, 30)`
            }
            else if(this.status == 'cleared'){
                this.rgb = 'rgb(84, 61, 17)'
            }
            else if(this.status == 'planted'){
                this.rgb = 'rgb(54, 39, 11)'
            }
            ctx.fillStyle = this.rgb
            ctx.fillRect(this.x, this.y, this.size, this.size)
            if(showLandId){
                ctx.fillStyle = '#AAA'
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
    constructor(x, y, plantTime, id, plantedLand, cF){
        this.x = x
        this.y = y

        this.id = id
        this.plantTime = plantTime + this.id.gTime

        this.kind = this.id.name
        this.status = 1
        this.plantedLand = plantedLand

        this.cF = cF // current farm
        this.draw = ()=>{
            let img = document.createElement('img')
            img.src = `https://sdg-ebenezer.github.io/farm-game/Pictures/${this.kind}%20Texture/pixil-frame-${this.status}.png`
            ctx.drawImage(img, this.x, this.y, landSize, landSize)
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
            ctx.drawImage(img, this.x, this.y, this.w, this.h)
            //text
            ctx.fillStyle = 'white'
            ctx.font = '20px Trebuchet MS'
            ctx.fillText(`#${this.par.id + 1}`, this.x + this.w - 25, this.y + this.h, 25)
        }
    }
}
class menuOption{
    constructor(id, pId){
        this.id = id
        this.pId = pId
        
        this.x = 0
        this.y = optionSize * id

        this.imgSrc = this.pId.mainImgSrc
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
class sellBtn{
    constructor(par, btnID, message){
        this.par = par
        this.btnID = btnID
        this.message = message
        this.x = this.par.x + menuWidth
        this.y = this.par.y
        this.w = menuWidth
        this.h = this.par.h
        this.color = '#222'
        this.draw = ()=>{   
            var fontPaddingW = 10   
            var fontPaddingH = this.h/2   
            ctx.fillStyle = this.color
            ctx.fillRect(this.x, this.y + 10, this.w, this.h - 40)
            //FONT
            ctx.fillStyle = 'white'
            ctx.font = `bold ${this.w/7.5}px Trebuchet MS`
            ctx.fillText(`Sell x${(quantity == "") ? 0 : quantity} ${this.message}`, this.x + fontPaddingW, this.y + fontPaddingH, this.w)
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
        this.size = canvas.height/8
        this.x = 0
        this.y = 0 + (this.size * this.id)
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
class buyBtn{
    constructor(id, par, btnID, message){
        this.par = par
        this.id = id
        this.btnID = btnID
        this.message = message

        this.w = 400
        this.h = 100
        this.x = this.par.x + this.par.size * 2.5
        this.y = this.par.y
        this.color = '#313131'
        this.draw = ()=>{   
            let fontPaddingW = 10   
            let fontPaddingH = this.h/2   
            ctx.save()
            ctx.translate(this.x, this.y)
            //FONT
            ctx.fillStyle = 'white'
            ctx.font = '20px Trebuchet MS'
            let s = (quantity != 1) ? "s" : ""
            ctx.fillText(`Buy x${(quantity == "") ? 0 : quantity} ${this.message}${s} (Grand Cost: $${this.btnID.cost * quantity})`, 
            fontPaddingW, fontPaddingH, this.w)
            ctx.restore()
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
        if(gameTick == crop.plantTime){
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
            let landChunk = new land(landX, landY, landChunkStatus, j)
            farms[k].landL.push(landChunk)  
            //calculate x,y
            if(landX + landSize <= canvas.width){
                if(landY + landSize >= canvas.height){
                    landX += landSize
                    landY = 0
                }
                else{
                    landY += landSize
                }
            }
        }
        landX = menuWidth
        landY = 0
    }
    //farm btn
    for(let f = 0; f < farms.length; f++){
        farmListPush(f)
    }
}
function generateNewLand(){
    farms.push(new farmOrganizer(farms.length))
    landX = landSize * 2
    landY = 0
    //
    for(let j = 0; j < landNum; j++){
        var landChunk = new land(landX, landY, (random(1, 100) == 1) ? 'cleared' : 'uncleared', j)
        farms[farms.length - 1].landL.push(landChunk)
        //calculate x,y
        if(landX + landSize <= canvas.width){
            if(landY + landSize >= canvas.height){
                landX += landSize
                landY = 0
            }
            else{
                landY += landSize
            }
        }
    }
    farmListPush(farms.length - 1)
    farmNum += 1
}
function farmListPush(i){
    let w = h = canvas.height/8
    let row = Math.floor(((i + 1) * w)/canvas.width) // # row
    let x = ((i - row) - (row * Math.floor(canvas.width/w)) + ((row > 0)? 1 : 0)) * w
    let y = row * h 
    console.log(Math.round(x), y)
    
    farmBtns.push(new farmBtn(x, y, w, h, farms[i]))
}
function drawLand(){
    for(let z = 0; z < farms[currentFarm].landL.length; z++){
        farms[currentFarm].landL[z].draw()
    }
}
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
function drawMenu(){
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
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    showMoney()
    drawMInputDisplay()
    mInputDisplay()
    bsBtn()

    if(sellNBuy){
        for(let i in menuOptionList){
            let produce = menuOptionList[i]
            produce.draw()
        }
        for(let i in sellBtnsList){
            sellBtnsList[i].draw()
        }
        displayList[currentDisplay].draw()
        displayBtn()
    }
    else{
        drawBuyDisplay()
        for(let i in buyBtnsList){
            buyBtnsList[i].draw()
        }
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
    if(!market){img.src = 'https://sdg-ebenezer.github.io/farm-game/Pictures/Market.png'}
    else{img.src = 'https://sdg-ebenezer.github.io/farm-game/Pictures/House.png'}
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
    if(quantity.length > 4) quantity = quantity.slice(0, -1)
}
function drawMInputDisplay(){
    var fontPadding = 2
    ctx.fillStyle = 'white'
    ctx.font = `${inputTextSize * 2/3}px Trebuchet MS`
    ctx.fillText('Custom Quantity:', inputx + fontPadding, inputy - (fontPadding * 3), inputw - fontPadding)
    if(active) ctx.fillStyle = '#999'
    else ctx.fillStyle = '#1f1f1f'
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
function bsBtn(){
    let img = document.createElement('img')
    if(sellNBuy) img.src = 'https://sdg-ebenezer.github.io/farm-game/Pictures/Buy.png'
    else if(sellNBuy == false) img.src = 'https://sdg-ebenezer.github.io/farm-game/Pictures/Sell.png'
    ctx.drawImage(img, bsBtnX - bsBtnW, bsBtnY, bsBtnW * 2, bsBtnH)
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
            plantList.push(new plant(Sland.x, Sland.y, gameTick, Object.values(plantIDs)[i], Pland, currentFarm))
            Sland.status = landStatus[2]
        }
    }
}
//
function cursor(x, y){
    let w = h = 20
    let img = document.createElement('img')
    if(((selectedCrop!=null)? selectedCrop.qty : -1 > 0) && !market && !help){
        img.src = `file:///C:/Users/User/Desktop/FarmGame/Pictures/Cursor/${selectedCrop.name}.png` 
    }
    else{
        img.src = `file:///C:/Users/User/Desktop/FarmGame/Pictures/Cursor/Crosshair.png`
    }
    ctx.drawImage(img, x - w/2, y - h/2, w, h)
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
    console.log(history[0], scrollValue)
    
    if(history.length > 0){
        if(history[0][1] >= 0){
            hstyScrollable.up = false
        }
        else{hstyScrollable.up = true}
        
        if(history[history.length-1][1] <= 0){
            hstyScrollable.down = false
        }
        else{hstyScrollable.down = true}
    }
    
    if(hsty){
        if(scrollValue > 0 && hstyScrollable.up || (scrollValue < 0 && hstyScrollable.down)){
            for(let i in history){
                history[i][1] += scrollValue
            }
        }
    }
    if(changeFarmPG){
        for(let i in farmBtns){
            let f = farmBtns[i]
            f.y += scrollValue * 30
        }
    }
}
function checkClick(x, y, w, h, mx, my){
    if(mx >= x && mx <= x + w && my >= y && my <= y + h) return true
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
                                Sland.g = random(30, 80)
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
                    for(let i in buyBtnsList){
                        let btn = buyBtnsList[i]
                        if(checkClick(0, btn.y, btn.w, btn.h, e.x, e.y) && money - (btn.btnID.cost  * quantity) >= 0 && parseInt(quantity) != 0){
                            btn.btnID.qty += parseInt(quantity)
                            money -= btn.btnID.cost * quantity
                            if(btn.par.pId.name == 'farm'){
                                for(let j = 0; j < parseInt(quantity); j++){
                                    if(farms.length < 80) generateNewLand()
                                }
                            }
                            history.push([`T${gameTick} || Bought x${quantity} ${btn.par.pId.name} for $${btn.btnID.cost * quantity}.`, 
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

/****UPDATE */
function startGame(){
    generateLand()
    for(let i = 0; i < Object.keys(plantIDs).length; i++){
        menuOptionList.push(new menuOption(i, Object.values(plantIDs)[i]))
    }
    for(let i = 0; i < Object.keys(plantIDs).length; i++){
        sellBtnsList.push(new sellBtn(menuOptionList[i], Object.values(plantIDs)[i], Object.values(plantIDs)[i].name)) // corn
    }
    for(let i = 0; i < Object.keys(plantIDs).length; i++){
        buyList.push(new buyOption(i, Object.values(plantIDs)[i]))
    }
    buyList.push(new buyOption(buyList.length, {
        name : 'Farm',
        cost : 10000,   
        qty : farmNum,
        mainImgSrc : 'https://sdg-ebenezer.github.io/farm-game/Pictures/Farm.png',
    }))
    for(let i = 0; i < buyList.length; i++){
        buyBtnsList.push(new buyBtn(i, buyList[i], buyList[i].pId, buyList[i].pId.name))
    }
    for(let i = 0; i < Object.keys(plantIDs).length; i++){
        displayList.push(new display(Object.values(plantIDs)[i]))
        //Object.values(plantIDs)[i]    
    }
}
startGame()
setInterval(function(){
    if(!market){
        //
        background()
        //
        drawMenu() 
        drawLand()
        drawCrops()
        drawMenuOptions()
        showMoney()
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
    timeCropGrowth() // crop growth
    //help
    if(help){
        helpF()
    }
    helpBtn()

    cursor(cursorX, cursorY)
}, 1000/fps)
/****GAME TICK */
setInterval(()=>{
    gameTick += 1
}, gameTickTime)
