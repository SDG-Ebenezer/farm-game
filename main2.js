/****CANVAS VARS/ETC. */
var canvasWidth = 800
var canvasHeight = 700
var canvas = document.getElementById('gameCanvas')
canvas.focus()
ctx = canvas.getContext("2d")
canvas.height = canvasHeight
canvas.width = canvasWidth

var gameTick = 0 //

var money = 1000 //

var mouseActive = true
var selectedCrop //= 'corn'
//market
var market = false // t/f
//
var changeFarmPG = false //
//help
var help = false
var helpBtnW = helpBtnH = iconSize
var helpBtnX = canvas.width - helpBtnW
var helpBtnY = canvas.height - (helpBtnH * 3)
//
var iconSize = 30
//
cursorStatusOptions = ['clear', 'plant', 'harvest']
cursorStatus = cursorStatusOptions[1]
//input
var quantity = "1"
var active = false //

var inputw = 200 //
var inputh = 30 //
var inputx = 10 //
var inputy = canvas.height - inputh - 45 //

//
landStatus = ['uncleared', 'cleared', 'planted']
//
var currentDisplay = 0
//btn
var displayBtnW = 200
var displayBtnH = 40
var displayBtnX = canvas.width - 400
var displayBtnY = 200 + 5
//change farm
var cfbw = cfbh = iconSize
var cfbx = canvas.width - cfbw
var cfby = canvas.height - (cfbh * 2)
//buy
var buyBtnY = canvas.height * 32/70
var maxBuyHeight = canvas.height - buyBtnY - inputy
var sellNBuy = true //
var bsBtnW = bsBtnH = iconSize
var bsBtnX = canvas.width - iconSize - bsBtnW
var bsBtnY = canvas.height - bsBtnH

//land
var lr, lg, lb
var partOf = 10 // each square is 1/<partOf> of the canvas size (e.g. if partOf is 20, then land size is 1/20)
var landSize = canvasHeight/partOf
var landX = landSize * 2
var landY = 0
//
var showLandId = false //

//menu
var menuWidth = landSize * 2
var optionSize = menuWidth * 2/3

//farms
var farmNum = 1 //start out num

/****GET RANDOM NUM */
function random(min, max){
    return Math.round(Math.random() * (max-min)) + min
}

/****LAND */
var currentLand = 0

class land{
    constructor(size, x, y, status, id){
        this.size = size
        this.x = x
        this.y = y
        this.g = random(50,80)
        this.status = status 
        this.id = id
        /*
        STATUS:  UNCLEARED -> CLEARED -> PLANTED
        */
        this.draw = ()=>{
            if(this.status == landStatus[0]){
                this.r = 3
                this.b = 30
            }
            else if(this.status == 'cleared'){
                this.r = 84
                this.g = 61
                this.b = 17
            }
            else if(this.status == 'planted'){
                this.r = 54
                this.g = 39
                this.b = 11
            }
            ctx.fillStyle = `rgb(${this.r}, ${this.g}, ${this.b})`
            ctx.fillRect(this.x, this.y, this.size, this.size)
            if(showLandId){
                ctx.fillStyle = '#AAA'
                ctx.font = '20px Trebuchet MS'
                ctx.fillText(this.id, this.x, this.y + 20)
            }
        }
    }
}

farms = []
class farmOrganizer{
    constructor(id){
        this.id = id
        this.landL = []
    }
}

/****PLANT */
const plantIDs = {
    corn : {
        name : 'Corn',
        profit : 25,
        cost : 25, 
        qty : 1,
        status : 8,
        gTime : 500,
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
        gTime : 200,
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
        gTime : 450,
        maxYield : 2,
        minYield : 3,
        mainImgSrc : 'https://sdg-ebenezer.github.io/farm-game/Pictures/Carrot%20Texture/pixil-frame-0.png',
        offColor : '#dba55a', 
        onColor : '#e68702',
    },  
}

/****PLANTED PLANTS */
plantList = []
class plant{
    constructor(x, y, plantTime, id, plantedLand, cF){
        this.x = x
        this.y = y

        this.id = id
        this.plantTime = plantTime

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
function timeGrowth(){    
    for(let i in plantList){
        var crop = plantList[i]
        for(let j = 0; j < Object.keys(plantIDs).length; j++){
            var Splant = Object.values(plantIDs)[j]
            if(gameTick == crop.plantTime + Splant.gTime){
                crop.plantTime += Splant.gTime
                if(crop.status < Splant.status) crop.status += 1
            }
        }
    }
}
function drawCrops(){
    for(let i in plantList){
        if(currentFarm == plantList[i].cF) plantList[i].draw()
    }
}

/****LAND/DRAW */
function redrawBackground(){
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}
function createLand(){ 
    //farm 
    for(let k = 0; k < farmNum; k ++){
        farms.push(new farmOrganizer(k))
        for(let j = 0; j < partOf ** 2 - partOf; j++){
            var landChunk = new land(landSize, landX, landY, (random(1, 100) == 1) ? 'cleared' : 'uncleared', j)
            farms[k].landL.push(landChunk)
            //calculate x,y
            if(landX + landSize <= canvasWidth){
                if(landY + landSize >= canvasHeight){
                    landX += landSize
                    landY = 0
                }
                else{
                    landY += landSize
                }
            }
        }
        landX = landSize * 2
        landY = 0
    }
    //farm btn
    for(let f = 0; f < farms.length; f++){
        let w = h = canvas.width/10
        let x = (farms[f].id * w >= canvas.width) ? (farms[f].id * w) - canvas.width * (Math.floor((farms[f].id * w)/canvas.width)) : farms[f].id * w
        let y = Math.floor(farms[f].id * w/canvas.width) * h
        console.log(x, y)
        farmBtns.push(new farmBtn(x, y, w, h, farms[f]))
    }
}
function createNewLandForFarm(){
    farms.push(new farmOrganizer(farms.length))
    landX = landSize * 2
    landY = 0
    for(let j = 0; j < partOf ** 2 - partOf; j++){
        var landChunk = new land(landSize, landX, landY, (random(1, 100) == 1) ? 'cleared' : 'uncleared', j)
        farms[farms.length - 1].landL.push(landChunk)
        //calculate x,y
        if(landX + landSize <= canvasWidth){
            if(landY + landSize >= canvasHeight){
                landX += landSize
                landY = 0
            }
            else{
                landY += landSize
            }
        }
    }
    let thing = farms[farms.length - 1].id
    let w = h = canvas.width/10
    farmBtns.push(new farmBtn((thing * w >= canvas.width) ? (thing * w) - canvas.width * (Math.floor((thing * w)/canvas.width)) : thing * w, 
                Math.floor(thing * w/canvas.width) * h, 
                w, 
                h, 
                farms[farms.length - 1]))
    farmNum += 1
}
var currentFarm = 0
function drawLand(){
    for(let z = 0; z < farms[currentFarm].landL.length; z++){
        farms[currentFarm].landL[z].draw()
    }
}
//change farm btn
function chgFarmBtn(){
    let img = document.createElement('img')
    img.src = 'https://sdg-ebenezer.github.io/farm-game/Pictures/farm%20icon.png'
    ctx.drawImage(img, cfbx, cfby, cfbw, cfbh)
    //
    let tSize = 20
    ctx.fillStyle = '#eee'
    ctx.font = '20px Trebuchet MS'
    ctx.fillText(`#${currentFarm + 1}`, canvas.width - tSize * 1.5, tSize)
}

farmBtns = []
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
            ctx.fillStyle = '#eee'
            ctx.font = '20px Trebuchet MS'
            ctx.fillText(`#${this.par.id + 1}`, this.x + this.w - 20, this.y + this.h)
        }
    }
}
function drawFarms(){
    ctx.fillStyle = '#00000066'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    for(let i in farmBtns){
        farmBtns[i].draw()
    }
}

/****MONEY */
function showMoney(){
    let fontSize = 30
    let fontPadding = 10
    let rectH = fontSize + fontPadding * 2
    let rectX = 0
    let rectY = canvasHeight - rectH
    //RECT
    ctx.fillStyle = '#000000aa'
    ctx.fillRect(rectX, rectY, landSize * 2, rectH)
    //FONT
    ctx.fillStyle = 'white'
    ctx.font = `${fontSize}px Trebuchet MS`
    ctx.fillText(`$${money}`, rectX + fontPadding, rectY + fontPadding + fontSize, landSize)
}

/****MENU */
menuOptionList = []
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
            if(this.pId.qty <= 0){
                ctx.fillStyle = '#00000099' 
                ctx.fillRect(this.x, this.y, this.w, this.h)
            }
            ctx.fillStyle = 'white'
            ctx.font = '20px Trebuchet MS'
            ctx.fillText(pId.qty, this.x + this.w, this.y + this.h)
        }
    }
}
for(let i = 0; i < Object.keys(plantIDs).length; i++){
    menuOptionList.push(new menuOption(i, Object.values(plantIDs)[i]))
}
function drawMenu(){
    //Menu
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, menuWidth, canvasHeight)
    //Get selected crop
    document.onclick = (e)=>{
        if(!market){    
            for(let i in menuOptionList){
                let option = menuOptionList[i]
                if(e.x >= option.x && e.x <= option.x + option.w &&
                    e.y >= option.y && e.y <= option.y + option.h){
                        selectedCrop = option.pId
                }
            }
        }
    }
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
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    showMoney()
    drawSellAmountInput()
    displayAmountTyped()
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
        drawDisplayBtn()
    }
    else{
        displayBuy()
        for(let i in buyBtnsList){
            buyBtnsList[i].draw()
        }
    }
}

/**** SELL */
sellBtnsList = []
class sellBtn{
    constructor(par, btnID, message){
        this.par = par
        this.btnID = btnID
        this.message = message
        this.x = par.x + (landSize * 2)
        this.y = par.y
        this.w = par.w * 2
        this.h = par.h
        this.color = '#222'
        this.draw = ()=>{   
            var fontPaddingW = 10   
            var fontPaddingH = this.h/2   
            ctx.fillStyle = this.color
            ctx.fillRect(this.x, this.y + 10, this.w, this.h - 40)
            //FONT
            ctx.fillStyle = 'white'
            ctx.font = '20px Trebuchet MS'
            ctx.fillText(`Sell x${(quantity == "") ? 0 : quantity} ${this.message}`, this.x + fontPaddingW, this.y + fontPaddingH, this.w)
            if(quantity > this.btnID.qty) this.color = '#cc0700'
            else{this.color = '#222'}
            
        }
    }
}
for(let i = 0; i < Object.keys(plantIDs).length; i++){
    sellBtnsList.push(new sellBtn(menuOptionList[i], Object.values(plantIDs)[i], Object.values(plantIDs)[i].name)) // corn
}
/**** */
//market/home btn
function drawMarketBtn(){
    var x = canvasWidth - iconSize
    var y = canvasHeight - iconSize
    var w = h = iconSize
    let img = document.createElement('img')
    if(!market){img.src = 'https://sdg-ebenezer.github.io/farm-game/Pictures/Market.png'}
    else{img.src = 'https://sdg-ebenezer.github.io/farm-game/Pictures/House.png'}
    ctx.drawImage(img, x, y, w, h)
    canvas.onclick = (e)=>{
        if(e.x >= x && e.x <= x + w && e.y >= y && e.y <= y + h){
            if(market) market = false
            else market = true
        }
    }
}

/**** INPUTS/ETC */
//quantity
function displayAmountTyped(){
	var fontPadding = 2
	ctx.fillStyle = 'white'
    ctx.font = 'bold 30px Trebuchet MS'
    ctx.fillText(`${quantity}`, inputx + fontPadding, inputy + inputh - fontPadding, inputw - fontPadding)
}
function type(num){
    if(active){
        quantity = quantity.concat(num)
    } 
    if(quantity.length > 4) quantity = quantity.slice(0, -1)
}
function drawSellAmountInput(){
    var fontPadding = 2
    ctx.fillStyle = 'white'
    ctx.font = '20px Trebuchet MS'
    ctx.fillText('Custom Quantity:', inputx + fontPadding, inputy - (fontPadding * 3), inputw - fontPadding)
    if(active) ctx.fillStyle = '#999'
    else ctx.fillStyle = '#1f1f1f'
    ctx.fillRect(inputx, inputy, inputw, inputh)
    if(quantity === ''){
        ctx.fillStyle = '#3f3f3f'
        ctx.font = '20px Trebuchet MS'
        ctx.fillText('AMOUNT', inputx + fontPadding, inputy + inputh - fontPadding, inputw - fontPadding)
    }
}

/****BUY */
buyList = []
class buyOption{
    constructor(id, pId){
        this.id = id
        this.pId = pId

        this.imgSrc = pId.mainImgSrc
        this.size = (! this.id * 75 > maxBuyHeight) ? 75 : maxBuyHeight/4
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
for(let i = 0; i < Object.keys(plantIDs).length; i++){
    buyList.push(new buyOption(i, Object.values(plantIDs)[i]))
}
buyList.push(new buyOption(buyList.length, {
    name : 'farm',
    profit : 0,
    cost : 10000,   
    qty : farmNum,
    mainImgSrc : 'https://sdg-ebenezer.github.io/farm-game/Pictures/Farm.png',
}))
buyBtnsList = []
class buyBtn{
    constructor(id, par, btnID, message){
        this.par = par
        this.id = id
        this.btnID = btnID
        this.message = message

        this.w = 400
        this.h = 100
        this.x = this.par.x + 200
        this.y = this.par.y
        this.color = '#313131'
        this.draw = ()=>{   
            var fontPaddingW = 10   
            var fontPaddingH = this.h/2   
            ctx.save()
            ctx.translate(this.x, this.y)
            //FONT
            ctx.fillStyle = 'white'
            ctx.font = '20px Trebuchet MS'
            ctx.fillText(`Buy x${(quantity == "") ? 0 : quantity} ${this.message} (Grand Cost: $${this.btnID.cost * quantity})`, 
            fontPaddingW, fontPaddingH, this.w)
            ctx.restore()
        }
    }
}
for(let i = 0; i < buyList.length; i++){
    buyBtnsList.push(new buyBtn(i, buyList[i], buyList[i].pId, buyList[i].pId.name))
}

function displayBuy(){
    for(let i in buyList){
        let bOption = buyList[i]
        bOption.drawMajorDisplay()
        bOption.draw()
    }
}

/**DISPLAY**/
displayList = []
class display{
	constructor(id, cur){
        this.id = id

    	this.offc = id.offColor
        this.onc = id.onColor
        this.min = id.minYield

        this.height = canvas.height/3
        this.width = canvas.width/25
        this.x = canvas.width - 400
        this.y = 10

        this.src = this.id.mainImgSrc
        this.max = this.id.profit

        this.cur = cur ?? Math.round(this.max)//current value
    	this.draw = ()=>{
            ctx.save()
            ctx.translate(this.x, this.y)
            ctx.fillStyle = '#212121'
            ctx.fillRect(0 + this.width + 15, 0 + 15, 0, 0)
            //
            let imgSize = 200
            var fontPadding = 10
            var fontSize = 20
            var textX = 0
            var textY = imgSize
            let img = document.createElement('img')
            img.src = this.src
            ctx.drawImage(img, 0, 0, imgSize, imgSize)
            //
            ctx.fillStyle = '#000000aa'
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
for(let i = 0; i < Object.keys(plantIDs).length; i++){
    displayList.push(new display(Object.values(plantIDs)[i]))
    //Object.values(plantIDs)[i]    
}
//next display
function drawDisplayBtn(){
    var textSize = displayBtnW * 2/3

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
        if(random(1,2) == 1 && display.id.profit + 1 <= display.max){
            display.id.profit += 1
        }
        else if(display.id.profit - 1 >= display.min){
            display.id.profit -= 1
        }
        display.cur = display.id.profit
    }
}, 1000)


/**** BUY/SELL BTN */
function bsBtn(){
    let img = document.createElement('img')
    if(sellNBuy) img.src = 'https://sdg-ebenezer.github.io/farm-game/Pictures/buy.png'
    else if(sellNBuy == false) img.src = 'https://sdg-ebenezer.github.io/farm-game/Pictures/sell.png'
    ctx.drawImage(img, bsBtnX, bsBtnY)
}

/**** HELP BTN */
function helpBtn(){
    //background
    ctx.fillStyle = '#00000066'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    //text
    
}
function displayHelpBtn(){
    let img = document.createElement('img')
    img.src = 'https://sdg-ebenezer.github.io/farm-game/Pictures/Help.png'
    ctx.drawImage(img, helpBtnX, helpBtnY, helpBtnW, helpBtnH)
}

/****GAME TICK */
setInterval(()=>{
    gameTick += 1
}, 100)
//
function findPlantKindForPlanting(Sland){
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
/****MOUSE HANDLER */
var otherKeys = {
    ctrl : false,
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
    //CTRL
    switch(e.key){
        case 'Control':
            otherKeys.ctrl = true
            break
        case 'Command':
            otherKeys.ctrl = true
            break
    }
}
window.onkeyup = (e)=>{
    switch(e.key){
        case 'Control':
            otherKeys.ctrl = false
            break
        case 'Command':
            otherKeys.ctrl = false
            break
    }
}
canvas.onmousedown = (e)=>{
    //left click [plant, clear, harvest, etc.]
    if(changeFarmPG != true){
        //not market
        if(!market){
            for(let i in farms[currentFarm].landL){
                let Sland = farms[currentFarm].landL[i]
                if(e.x >= Sland.x && e.x <= Sland.x + Sland.size &&
                    e.y >= Sland.y && e.y <= Sland.y + Sland.size){
                    //clear land
                    if(Sland.status == landStatus[0] && money - 100 >= 0){
                        if(otherKeys.ctrl){
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
                            Sland.r = 84
                            Sland.g = 61
                            Sland.b = 17
                        }
                    }
                    //plant
                    else if(Sland.status == landStatus[1] && selectedCrop != null){
                        if(otherKeys.ctrl){
                            for(var j in farms[currentFarm].landL){
                                Sland = farms[currentFarm].landL[j]
                                if(selectedCrop.qty > 0 && Sland.status == 'cleared'){
                                    findPlantKindForPlanting(Sland)
                                }
                            }
                        }
                        else{
                            findPlantKindForPlanting(Sland)
                        }
                        
                    }
                    //harvest
                    else if(Sland.status == landStatus[2]){
                        if(otherKeys.ctrl){
                            let checkCrop
                            for(const crop of plantList.values()){
                                if(crop.x == Sland.x && crop.y == Sland.y) checkCrop = crop
                            } 
                            for(let cropCC = 0; cropCC < plantList.length; cropCC+=0){
                                var crop = plantList[cropCC]
                                if(checkCrop.kind == crop.kind){
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
                            let checkCrop
                            for(const crop of plantList.values()){
                                if(crop.x == Sland.x && crop.y == Sland.y) checkCrop = crop
                            } 
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
        //market
        else if(market){
            if(sellNBuy){
                for(let i in sellBtnsList){
                    let btn = sellBtnsList[i]
                    if(e.x >= btn.x && e.x <= btn.x + btn.w 
                        && e.y >= btn.y && e.y <= btn.y + btn.h 
                        && btn.btnID.qty > 0 && parseInt(quantity) != 0){
                            if(parseInt(quantity) <= btn.btnID.qty){
                                money += btn.btnID.qty * parseInt(quantity) ?? 1
                                btn.btnID.qty -= parseInt(quantity) ?? 1
                            }
                    }
                }
            }
            else{
                for(let i in buyBtnsList){
                    let btn = buyBtnsList[i]
                    if(e.x >= btn.x && e.x <= btn.x + btn.w 
                        && e.y >= btn.y && e.y <= btn.y + btn.h 
                        && money - (btn.btnID.cost  * quantity) >= 0 && quantity != 0){
                            btn.btnID.qty += parseInt(quantity)
                            money -= btn.btnID.cost * quantity
                            if(btn.par.pId.name == 'farm') createNewLandForFarm() 
                    }
                }
            }
        }
        //input
        if(e.x > inputx && e.x < inputx + inputw && e.y > inputy && e.y < inputy + inputh){
            console.log(active, parseInt(quantity))
            quantity = ''
            active = true
        }
        else{
            active = false
        }
        //
        if(e.x >= displayBtnX && e.x <= displayBtnX + displayBtnW && e.y >= displayBtnY && e.y <= displayBtnY + displayBtnH){
            currentDisplay += 1
            if(currentDisplay > displayList.length - 1) currentDisplay = 0
        }
        //sell/buy btn
        if(e.x >= bsBtnX && e.x <= bsBtnX + bsBtnW && e.y >= bsBtnY && e.y <= bsBtnY + bsBtnH && market){
            if(sellNBuy) sellNBuy = false
            else if(sellNBuy == false) sellNBuy = true
        }
    }
    //change farm button
    if(e.x >= cfbx && e.x <= cfbx + cfbw && e.y >= cfby && e.y <= cfby + cfbh && !market){
        if(changeFarmPG) changeFarmPG = false
        else if(!changeFarmPG) changeFarmPG = true
    }
    //change farm
    if(changeFarmPG){
        let sFarm
        for(const btn of farmBtns.values()){
            if(e.x >= btn.x && e.x <= btn.x + btn.w && e.y >= btn.y && e.y <= btn.y + btn.h){
                sFarm = btn.par.id
            }
        }
        if(sFarm != null) currentFarm = sFarm
    }
    //help btn
    if(e.x >= helpBtnX && e.x <= helpBtnX + helpBtnW && e.y >= helpBtnY && e.y <= helpBtnY + helpBtnH){
        if(help) help = false
        else{help = true}
        console.log(help)
    }
}
/****UPDATE */
createLand()
setInterval(function(){
    if(!market){
        //
        redrawBackground()
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
    timeGrowth() // crop growth
    displayHelpBtn()
    if(help){
        helpBtn()
    }
}, 50)