var IsDragging = false //Used in editPieMenu for Divs with sliders and number inputs
var editPieMenu = {
    selectedPieKey: {},
    selectedPieMenu: {},
    selectedSlice: {},
    open: function(pieKeyObj){        
        this.selectedPieKey = pieKeyObj;        
        this.selectPieMenu(0);
        this.slice.select(0);        
        this.loadSelectedPieKey();  
        this.pieMenuDisplay.loadPieMenuElements(this.selectedPieMenu);
        this.pieMenuDisplay.draw.elements(editPieMenu.pieMenuDisplay.elements)
        $('[href="#tab-2"]').tab('show');               
        return
    },
    initialize: function(){
        let disp = editPieMenu.pieMenuDisplay


        var elementExists = document.getElementById("pie-menu-foreground")
        if(!elementExists){
            addInteractionCanvas()
            editPieMenu.pieMenuDisplay.canvasForeground = document.getElementById('pie-menu-foreground')
        }
        
        function addInteractionCanvas(){
            var canvas = document.createElement("canvas");
            canvas.id = "pie-menu-foreground"
            canvas.style.cssText = "position:absolute;left:0;top:93";
            document.getElementById("pie-menu-display-div").appendChild(canvas);
        };

        document.getElementById('edit-pie-menu-back-btn').addEventListener('click', function(){
            if (editPieMenu.selectedPieKey.pieMenus.indexOf(editPieMenu.selectedPieMenu) == 0){
                profileManagement.open();
            } else { 
                let parentMenuIndex = editPieMenu.findSubMenuParent() 
                let parentMenu = editPieMenu.selectedPieKey.pieMenus[parentMenuIndex];
                editPieMenu.selectPieMenu(parentMenuIndex);
                // selectParentMenuSlice(parentMenu, editPieMenu.selectedPieKey.pieMenus.indexOf(editPieMenu.selectedPieMenu))              
                
                
                // function selectParentMenuSlice(parentMenu, pieMenuNumber){
                //     for (k in parentMenu.functions){
                //         let func = parentMenu.functions[k];
                //         if (func.function == "submenu"){
                //             if(func.params.pieMenuNumber == pieMenuNumber){
                //                 console.log("Worked")
                //                 editPieMenu.selectPieMenu(parentMenuIndex);
                //                 editPieMenu.slice.select(3);
                //                 return
                //             }                                
                //         }
                //     }
                // };
                $('[href="#tab-10"]').tab('show');
            }
        });

        let pieKeyBtn = document.getElementById('piekey-change-btn');
        pieKeyBtn.addEventListener('click',function(){
            assignKey().then(val => {
                editPieMenu.selectedPieKey.hotkey = val.ahkKey 
                pieKeyBtn.innerHTML = val.displayKey                 
                $('[href="#tab-2"]').tab('show');
            }, val => {
                $('[href="#tab-2"]').tab('show');
            });            
        });
        let pieKeyNameTextInput = document.getElementById('edit-piekey-name-text-input');
        pieKeyNameTextInput.addEventListener('change',function(event){
            editPieMenu.selectedPieKey.name = event.target.value;
        });


        createWindowSizeListener(function(){             
            //If in Edit Pie Menu Tab
            if($('#app-tabs > .nav-tabs .active').text() == "Edit Pie Menu"){
                disp.loadPieMenuElements(editPieMenu.selectedPieMenu);
                disp.draw.elements(editPieMenu.pieMenuDisplay.elements);
            }            
        });
        canvas = document.getElementById('pie-menu-center');
        fgCanvas = document.getElementById('pie-menu-foreground');
        // bgCanvas = document.getElementById('pie-menu-background');

        
        fgCanvas.addEventListener("mousemove", function(mouseEvent) {
            handleMouseMove(mouseEvent);
            // editPieMenu.pieMenuDisplay.refresh(mouseEvent)
        });
        fgCanvas.addEventListener("mousedown", function(mouseEvent) {
            handleMouseDown(mouseEvent);
            // editPieMenu.selectSlice();
            // console.log("mousedown")
            // editPieMenu.pieMenuDisplay.refresh(mouseEvent)
        });
        fgCanvas.addEventListener("mouseup", function(mouseEvent) {
            handleMouseUp(mouseEvent);
            // editPieMenu.selectSlice();
            // console.log("mouseup")
            
        });

        //Initialize all other control pages.
        this.launchSettings.initialize();
        this.appearanceSettings.initialize();
        this.sliceSettings.initialize();
        
        var clickedPosition
        var clickedElement
        function handleMouseMove(mouseEvent){            
            let mouse = disp.getMouse(mouseEvent)
            //Dragging?
            if (clickedPosition && clickedElement){
                if( Math.abs(clickedPosition[0]-mouse.position[0]) > 5 || Math.abs(clickedPosition[1]-mouse.position[1]) > 5 ){
                    if(clickedElement){
                        clickedElement.isDragging = true;                        
                        disp.draw.elements(editPieMenu.pieMenuDisplay.elements);                    
                    }
                }
            }
            var draggingElement = disp.elements.filter(element => {                
                return element.isDragging == true
            })
            draggingElement = draggingElement[0]
            if(draggingElement && draggingElement.type == "sliceLabel"){
                // console.log(draggingElement);
                disp.setActiveCanvas(2);
                // disp.clearActiveCanvas();              
                let eData = draggingElement.data;
                disp.draw.label(eData.label, eData.icon, eData.hotkey, mouse.position,[0,0]);         
                disp.setActiveCanvas(1);
            }

            //Test for object hovered over
        };
        function handleMouseDown(mouseEvent){          
            
            
            let mouse = disp.getMouse(mouseEvent)
            clickedPosition = mouse.position

            clickedElement = disp.getElementUnderMouse(mouse);  
            // console.log(clickedElement);

            disp.draw.elements(editPieMenu.pieMenuDisplay.elements);            
        };
        function handleMouseUp(mouseEvent){
            let mouse = disp.getMouse(mouseEvent)
            let releaseElement = disp.getElementUnderMouse(mouse)
            
            //Dragging?
            var draggingElement = disp.elements.filter(element => {                
                return element.isDragging == true
            })

            for (k in draggingElement){
                draggingElement[k].isDragging = false;                
            }              
            draggingElement = draggingElement[0];
            
            if(draggingElement && draggingElement.type == "sliceLabel"){
                draggingElement.isDragging = false;
                //Check if hovered over another slice to validate swap                
                let swapLabelElement = releaseElement;
                if (swapLabelElement && swapLabelElement.type == "sliceLabel") {
                    editPieMenu.slice.swap(clickedElement.data, swapLabelElement.data);                    
                }                
                disp.setActiveCanvas(2);
                disp.clearActiveCanvas();                     
            }else if(clickedElement && clickedElement == releaseElement){
                if(clickedElement.selectable == true){
                    editPieMenu.slice.select(clickedElement.data);
                } else {                    
                    if(clickedElement.type == "addSliceBtn"){                        
                        editPieMenu.slice.add(clickedElement.data)
                    } else if(clickedElement.type == "deleteSliceBtn"){
                        editPieMenu.slice.delete(clickedElement.data)
                    }                    
                }
            }
            clickedElement = null;
            clickedPosition = null;
            disp.draw.elements(editPieMenu.pieMenuDisplay.elements);
        };      

    },
    loadSelectedPieKey:function(){
        let pieKeyBtn = document.getElementById('piekey-change-btn');        
        pieKeyBtn.innerHTML = getKeyObjFromAhkString(editPieMenu.selectedPieKey.hotkey).displayKey
        let pieKeyNameTextInput = document.getElementById('edit-piekey-name-text-input');
        pieKeyNameTextInput.value = editPieMenu.selectedPieKey.name;
        this.launchSettings.loadSelectedPieKey();
        this.appearanceSettings.loadSelectedPieKey();
        this.sliceSettings.loadSelectedPieKey();
    },
    selectPieKey: function(pieKeyNumber){},
    selectPieMenu: function(pieMenuNumber){
        editPieMenu.selectedPieMenu = editPieMenu.selectedPieKey.pieMenus[pieMenuNumber];
        if (pieMenuNumber == 0){
            editPieMenu.appearanceSettings.mainMenu.show();
        }else{
            editPieMenu.appearanceSettings.subMenu.show();
        } 
        this.slice.select(0)

        let backBtn = document.getElementById('edit-pie-menu-back-btn');
        if (editPieMenu.selectedPieKey.pieMenus.indexOf(editPieMenu.selectedPieMenu) == 0){
            backBtn.innerHTML = "<i class=\"icon ion-chevron-left\" style=\"margin-right: 12px;\"></i>Back"
        } else {
            backBtn.innerHTML = "<i class=\"icon ion-chevron-left\" style=\"margin-right: 12px;\"></i>To Parent Menu"
        }
        editPieMenu.pieMenuDisplay.refresh();       
    },
    findSubMenuParent: function(){
        for (let pieMenuIndex in editPieMenu.selectedPieKey.pieMenus){
            let pieMenu = editPieMenu.selectedPieKey.pieMenus[pieMenuIndex];
            for (let sliceFuncIndex in pieMenu.functions){
                let sliceFunc = pieMenu.functions[sliceFuncIndex];
                if(sliceFunc.function == "submenu"){                                
                    if(sliceFunc.params.pieMenuNumber == editPieMenu.selectedPieKey.pieMenus.indexOf(editPieMenu.selectedPieMenu)){
                        return pieMenuIndex                  
                    }
                }
            }
        }
        console.log("Didn't find parent")
        return 0
    },
    slice:{        
        select: function(slice){
            let previousSelectedSlice = editPieMenu.selectedSlice;
            if(typeof slice == "number"){                
                editPieMenu.selectedSlice = editPieMenu.selectedPieMenu.functions[slice]
            }else{
                let sliceIndex = editPieMenu.selectedPieMenu.functions.indexOf(slice);
                editPieMenu.selectedSlice = editPieMenu.selectedPieMenu.functions[sliceIndex];
            }
            
            if(editPieMenu.selectedSlice.params.isBack == true){  // Don't allow back function to be selected.
                editPieMenu.selectedSlice = previousSelectedSlice;
                return
            }
            for (k in editPieMenu.pieMenuDisplay.elements){ //unselect all elements
                let element = editPieMenu.pieMenuDisplay.elements[k];
                element.isSelected = false
            }         
            editPieMenu.appearanceSettings.loadSelectedPieKey();
            editPieMenu.sliceSettings.loadSelectedPieKey();  
            editPieMenu.pieMenuDisplay.loadPieMenuElements(editPieMenu.selectedPieMenu);                     
        },
        swap: function(slice1, slice2){
            if (slice1.params.isBack == true || slice2.params.isBack == true){
                
            }else{
                let selectedPieMenu = editPieMenu.selectedPieMenu;   
                let s1Index = selectedPieMenu.functions.indexOf(slice1);
                let s2Index = selectedPieMenu.functions.indexOf(slice2);            
                [selectedPieMenu.functions[s1Index],selectedPieMenu.functions[s2Index]] = [selectedPieMenu.functions[s2Index],selectedPieMenu.functions[s1Index]];
            }
            editPieMenu.pieMenuDisplay.loadPieMenuElements(editPieMenu.selectedPieMenu);                     
            
        },
        add: function(insertAfterSlice=null, sliceObj=null){
            let selectedPieMenu = editPieMenu.selectedPieMenu;
            let selectedSliceIndex            
            
            if(insertAfterSlice == null){
                selectedSliceIndex = selectedPieMenu.functions.indexOf(editPieMenu.selectedSlice);                
            } else {
                selectedSliceIndex = insertAfterSlice;                
            }              
            if(sliceObj == null){
                sliceObj = {
                    function: "none",
                    params: {},
                    label: "Slice " + selectedSliceIndex,
                    hotkey: "",
                    clickable: false,
                    returnMousePos: false,
                    icon: {
                        filePath: "",
                        WBOnly: true
                        }
                    }
            }             
            selectedPieMenu.functions.splice(selectedSliceIndex+1,0,sliceObj)
            editPieMenu.pieMenuDisplay.loadPieMenuElements(editPieMenu.selectedPieMenu);
            editPieMenu.pieMenuDisplay.refresh();
        },
        delete: function(slice=null){
            let deleteIndex
            if (slice == null){
                deleteIndex = editPieMenu.selectedPieMenu.functions.indexOf(editPieMenu.selectedSlice);
            }else{
                deleteIndex = slice;                
            }            
            editPieMenu.selectedPieMenu.functions.splice(deleteIndex,1);                        
            editPieMenu.pieMenuDisplay.loadPieMenuElements(editPieMenu.selectedPieMenu);
            editPieMenu.pieMenuDisplay.refresh();
            editPieMenu.slice.select(0);
        }
    },
    pieMenuDisplay:{
        canvas: document.getElementById('pie-menu-center'),
        canvasForeground: document.getElementById('pie-menu-foreground'),
        centerPos:[0,0],
        setActiveCanvas:function(layerNumber=1){
            if (layerNumber == 1){ //Main Layer
                editPieMenu.pieMenuDisplay.activeCanvas = editPieMenu.pieMenuDisplay.canvas                
            }
            else if (layerNumber == 2){ //Foreground layer
                editPieMenu.pieMenuDisplay.activeCanvas = editPieMenu.pieMenuDisplay.canvasForeground
            }          
        },
        clearActiveCanvas:function(){
            ctx = editPieMenu.pieMenuDisplay.activeCanvas.getContext("2d");            
            ctx.clearRect(0,0,canvas.width,canvas.height)
        },
        activeCanvas: {},
        elements:[
            {
                type:"pieCircle",
                data:null,
                region:{rect:[20,20,50,50], arc:[0,360,0,20]},
                selectable:true,
                isSelected:false,
                draggable:false,
                isDragging:false,
                isHovered:false,
                isClicked:false          
            },
            {
                type:"addSliceBtn",
                data:null,
                region:{rect:[20,20,50,50], arc:null},
                isSelected:false,
                draggable:false,
                isDragging:false,
                isHovered:false,
                isClicked:false          
            },
            {
                type:"deleteSliceBtn",
                data:null,
                region:{rect:[20,20,50,50], arc:null},
                isSelected:false,
                draggable:false,
                isDragging:false,
                isHovered:false,
                isClicked:false
            },
            {
                type:"sliceLabel",
                data:{},
                region:{rect:[20,20,50,50], arc:[0,60,0,20]},
                isSelected:false,
                draggable:true,
                isDragging:false,
                isHovered:false,
                isClicked:false          
            }
        ],
        loadPieMenuElements:function(pieMenuObj){
            elements = this.elements;
            elements.length = 0; //Clear elements                        

            //Add pie circle  
                      
            pieCircleElement = {
                type:"pieCircle",
                data:pieMenuObj.functions[0],
                region:{rect:null, arc:[0,360,0,pieMenuObj.radius]},
                selectable:true,
                isSelected:false,
                draggable:false,
                isDragging:false,
                isHovered:false,
                isClicked:false          
            };
            elements.push(pieCircleElement)

            //Add slices
            
            for(let i=1; i < pieMenuObj.functions.length; i++){
                pieSliceLabelObj = {
                    type:"sliceLabel",
                    data:pieMenuObj.functions[i],
                    region:{rect:[0,0,0,0], arc:[0,0,0,0]},
                    selectable:true,
                    isSelected:false,
                    draggable:true,
                    isDragging:false,
                    isHovered:false,
                    isClicked:false          
                };
                elements.push(pieSliceLabelObj)
            }   
        },
        draw:{
            rect:function(position, color='blue'){
                c = editPieMenu.pieMenuDisplay.activeCanvas;
                ctx = c.getContext("2d");
    
                ctx.beginPath();
                ctx.fillStyle = color;
                ctx.fillRect(position[0], position[1], 20, 20);
                // ctx.fillRect(50, 50, 20, 20);
            },
            pieCircle:function(pieCircleElement, position){
                // let selectedPieKey = editPieMenu.selectedPieKey
                let selectedPieMenu = editPieMenu.selectedPieMenu
                ctx = editPieMenu.pieMenuDisplay.activeCanvas.getContext("2d");                
                // let selectedSlice = editPieMenu.selectedSlice

                thickness = selectedPieMenu.thickness;
                pieRadius = selectedPieMenu.radius+(thickness/2);
                centerPos = position;



                ctx.lineWidth = thickness                  
                ctx.strokeStyle = rgbToHex(selectedPieMenu.backgroundColor)                
                ctx.beginPath();
                ctx.arc(centerPos[0], centerPos[1], pieRadius, 0, 2 * Math.PI);
                ctx.stroke();

                pieCircleElement.region = {rect:null,arc:[0,360,0,pieRadius]}                
                
                //Draw Selected Region Slice
                ctx.beginPath();
                //if index of selected slice is 0
                if (pieCircleElement.isSelected == true){                    
                    
                    ctx.lineWidth = (thickness/2);
                    ctx.strokeStyle = rgbToHex(selectedPieMenu.selectionColor);
                    
                    ctx.arc(centerPos[0], centerPos[1], pieRadius-(thickness/4), 0, 2 * Math.PI);
                    ctx.stroke();
                }
            },
            label: function(labelText, labelIcon, sliceHotkey, labelPos, labelAnchor=[0,0], element=null){                

                //Initialize font canvas settings
                ctx = editPieMenu.pieMenuDisplay.activeCanvas.getContext("2d"); 
                ctx.font = AutoHotPieSettings.global.globalAppearance.fontSize.toString() + "px " + AutoHotPieSettings.global.globalAppearance.font;               
    
                //Determine Content Box using text and icon
                // let iconFolder = AutoHotPieSettings.global.pieIconFolder
                selectedPieMenu = editPieMenu.selectedPieMenu
                // let iconFolder = './icons'
                let iconDiv = document.getElementById('image-buffer');
                let iconImg = getImageFromBuffer(labelIcon.filePath);
                // let iconColor = selectedPieMenu.selectionColor
                let iconSize = AutoHotPieSettings.global.globalAppearance.iconSize
                let textHeight = ctx.measureText("W").actualBoundingBoxAscent
                // console.log(textHeight)
                let minLabelWidth = AutoHotPieSettings.global.globalAppearance.minimumLabelWidth

                let innerWidthPadding = 6;
                let outerBoxPadding = 6;

                //determine if label is selected
                let isSelected = false
                if(element){
                    isSelected = element.isSelected;      
                }

                function getImageFromBuffer(filename){   
                    let returnImage = false 
                    let imagesHTMLCollection = iconDiv.getElementsByTagName('img')
                    var images = [].slice.call(imagesHTMLCollection);
                    images.forEach(function(element, index){
                        if (element.src.split('/').slice(-1)[0] == escape(filename)){
                            returnImage = element
                        }                                
                    })
                    return returnImage
                }
                
                //Load labelElements array
                let labelElements = [];
                if(iconImg){                    
                    let newElement = {type:"icon",data:iconImg,rect:[iconSize,iconSize],padding:[innerWidthPadding,innerWidthPadding]}
                    labelElements.push(newElement)
                }
                if(labelText != ""){
                    let textBox = ctx.measureText(labelText);
                    let newElement = {type:"labelText",data:labelText,rect:[textBox.width,textHeight],padding:[innerWidthPadding,innerWidthPadding]}
                    labelElements.push(newElement)
                }
                if(sliceHotkey != ""){
                    let textBox = ctx.measureText(sliceHotkey); 
                    let newElement = {type:"hotkeyText",data:sliceHotkey,rect:[textBox.width,textHeight],padding:[innerWidthPadding,innerWidthPadding]}                   
                    labelElements.push(newElement)
                }                  
                
                //Determine content rect
                let contentBox = [0,iconSize];
                for (let k in labelElements){                    
                    let labelElement = labelElements[k];
                    let padding
                    if (k == labelElements.length-1){
                        padding = 0;
                    }else{
                        padding = labelElement.padding[0]
                    }
                    contentBox = [Math.ceil(contentBox[0]+labelElement.rect[0]+padding),iconSize]
                }
                //Set positioning variables
                let labelSize = [Math.max(contentBox[0]+(2*outerBoxPadding),minLabelWidth,contentBox[1]+(2*outerBoxPadding)),contentBox[1]+(2*outerBoxPadding)]
                let labelCenter = [labelPos[0]-( labelAnchor[0]*(labelSize[0]/2) )+(labelAnchor[0]*(labelSize[1]/2)), labelPos[1]+( labelAnchor[1]*(labelSize[1]/2) ) ] //May need -                
                //Draw label background rect
                if(isSelected){
                    ctx.fillStyle = rgbToHex(selectedPieMenu.selectionColor);            
                    ctx.strokeStyle = rgbToHex(selectedPieMenu.selectionColor);                    
                }else{
                    ctx.fillStyle = rgbToHex(selectedPieMenu.backgroundColor);            
                    ctx.strokeStyle = rgbToHex(AutoHotPieSettings.global.globalAppearance.safetyStrokeColor);
                }                
                ctx.lineWidth = 1;    
                roundRect(ctx, labelCenter[0]-(labelSize[0]/2), labelCenter[1]-(labelSize[1]/2), labelSize[0], labelSize[1],1,true,true);
                
                //Draw label elements
                elementPlacementPos = [labelCenter[0]-(contentBox[0]/2), labelCenter[1]]
                for (let k in labelElements){
                    let labelElement = labelElements[k];
                    if (labelElement.type == "icon"){                        
                        if (labelIcon.WBOnly == true){
                            let tintedIconCanvas;
                            let iconPosition = [elementPlacementPos[0], elementPlacementPos[1]-(labelElement.rect[1]/2)]                
                            if(isSelected){
                                tintedIconCanvas = filterIcon(labelElement.data, selectedPieMenu.backgroundColor)                
                            }else{
                                tintedIconCanvas = filterIcon(labelElement.data, selectedPieMenu.selectionColor)
                            }
                            // Initaliase a 2-dimensional drawing context
                            ctx.drawImage(tintedIconCanvas, iconPosition[0], iconPosition[1], labelElement.rect[0], labelElement.rect[1]);
                        } else {                                
                            ctx.drawImage(labelElement.data, iconPosition[0], iconPosition[1], labelElement.rect[0], labelElement.rect[1]);
                        }
                        
                        elementPlacementPos = [elementPlacementPos[0]+labelElement.rect[0]+labelElement.padding[0],elementPlacementPos[1]]

                    }
                    if (labelElement.type == "labelText"){
                        if(isSelected){
                            ctx.fillStyle = rgbToHex(selectedPieMenu.backgroundColor);                   
                        }else{
                            ctx.fillStyle = rgbToHex(AutoHotPieSettings.global.globalAppearance.fontColors.white);
                            // ctx.fillStyle = "rgba(255,255,255,0.5)";
                        }
                        ctx.textAlign = "center";
                        let textPos = [elementPlacementPos[0]+(labelElement.rect[0]/2),elementPlacementPos[1]+(labelElement.rect[1]/2)]
                        // let textPos = [elementPlacementPos[0]+(labelElement.rect[0]/2),elementPlacementPos[1]]
                        ctx.fillText(labelElement.data, textPos[0], textPos[1]);
                        }
                    if (labelElement.type == "hotkeyText"){
                        if(isSelected){
                            ctx.fillStyle = rgbToHex(selectedPieMenu.backgroundColor); 
                            // ctx.fillStyle = "rgba(255,255,255,0.5)";                  
                        }else{
                            // ctx.fillStyle = rgbToHex(AutoHotPieSettings.global.globalAppearance.fontColors.white);
                            ctx.fillStyle = "rgba(255,255,255,0.5)";
                        }
                        ctx.textAlign = "center";
                        let textPos = [labelCenter[0]+(contentBox[0]/2)-(labelElement.rect[0]/2), labelCenter[1]+(labelElement.rect[1]/2)]
                        // let textPos = [labelCenter[0]+(contentBox[0]/2)-(labelElement.rect[0]/2), labelCenter[1]+(labelElement.rect[1])]
                        ctx.fillText(labelElement.data, textPos[0], textPos[1]);
                        }
                    }
                
                

                
                

                
                
                
    
                
                // let textBox = ctx.measureText(labelText)    
                
                // let textBounds = [textBox.width, textBox.fontBoundingBoxAscent + textBox.fontBoundingBoxDescent]


                // let contentBox = [];
                // if(iconImg){
                //     iconTextPadding = 6;
                //     contentBox = [textBounds[0]+iconTextPadding+iconSize,Math.max(textBounds[1],iconSize)]
                // }else{
                //     contentBox = [textBounds[0],Math.max(textBounds[1],iconSize)]
                //     // contentBox = [textBounds[0],textBounds[1]]
                // }                        
                
                
              
                               
                
               
    
                // if (iconImg){                    
                //     // iconPosition = [labelPosCenter[0]-(iconSize/2),labelPosCenter[1]-(iconSize/2)]
                //     iconPosition = [contentBoxTopLeft[0],contentBoxTopLeft[1]]
                                                                        
                //     if (labelIcon.WBOnly == true){
                //         let tintedIconCanvas;                     
                //         if(isSelected){
                //             tintedIconCanvas = filterIcon(iconImg, selectedPieMenu.backgroundColor)                
                //         }else{
                //             tintedIconCanvas = filterIcon(iconImg, selectedPieMenu.selectionColor)
                //         }
                //         // Initaliase a 2-dimensional drawing context
                //         ctx.drawImage(tintedIconCanvas, iconPosition[0],iconPosition[1], iconSize, iconSize);
                //     } else {                                
                //         ctx.drawImage(iconImg, iconPosition[0],iconPosition[1], iconSize, iconSize);
                //     }                            
                // }

                function filterIcon(img, color) {
                    // Create an empty canvas element
                    var buffer = document.createElement("canvas");
                    buffer.width = img.width;
                    buffer.height = img.height;
                
                    // Copy the image contents to the canvas
                    var btx = buffer.getContext("2d");
                    btx.drawImage(img, 0, 0);
                    var imgData = btx.getImageData(0,0,buffer.width,buffer.height);
                    var i;
                    // for (var i = 0; i < imgData.length; i += 4) {
                    //     iData[i]     = color[0]; // red
                    //     iData[i + 1] = color[1]; // green
                    //     iData[i + 2] = color[2]; // blue
                    // }
                    for (i = 0; i < imgData.data.length; i += 4) {
                        imgData.data[i]     = color[0]; // red
                        imgData.data[i + 1] = color[1]; // green
                        imgData.data[i + 2] = color[2]; // blue
                    }
                    btx.putImageData(imgData,0,0)                            
                    return buffer
                }
                return [labelCenter[0]-(labelSize[0]/2), labelCenter[1]-(labelSize[1]/2), labelSize[0], labelSize[1]]
                
                
            },
            elements:function(elements){
                //init
                let selectedPieKey = editPieMenu.selectedPieKey
                let selectedPieMenu = editPieMenu.selectedPieMenu
                let selectedSlice = editPieMenu.selectedSlice
                let disp = editPieMenu.pieMenuDisplay
                
                let c = document.getElementById('pie-menu-center');
                let cFG = document.getElementById('pie-menu-foreground');
                let ctx = c.getContext("2d");
                let cFGtx = cFG.getContext("2d");
                ctx.clearRect(0,0,canvas.width,canvas.height)

                // let bounds = [window.innerWidth, window.innerHeight];
                let bounds = [window.innerWidth, Math.max(selectedPieMenu.radius+selectedPieMenu.labelRadius+200,400)];  //FIX ME
                c.width = bounds[0]
                c.height = bounds[1]          
                cFG.width = bounds[0]
                cFG.height = bounds[1]            
                c.style.backgroundColor = "white";
                
                editPieMenu.pieMenuDisplay.centerPos = [bounds[0]/2,bounds[1]/2];                
                let centerPos = editPieMenu.pieMenuDisplay.centerPos; 
                
                //add button elements if slice is seleted               
                if(editPieMenu.selectedSlice != editPieMenu.selectedPieMenu.functions[0]){
                    disp.elements.push({
                        type:"addSliceBtn",
                        data:null,
                        region:{rect:[0,0,0,0], arc:null},
                        selectable:false,
                        isSelected:false,
                        draggable:false,
                        isDragging:false,
                        isHovered:false,
                        isClicked:false          
                    })
                    disp.elements.push({
                        type:"deleteSliceBtn",
                        data:null,
                        region:{rect:[0,0,0,0], arc:null},
                        selectable:false,
                        isSelected:false,
                        draggable:false,
                        isDragging:false,
                        isHovered:false,
                        isClicked:false          
                    })
                }


                //determine selected slice and set element state
                for (k in elements){
                    element = elements[k]
                    if (selectedSlice == element.data){
                        element.isSelected = true;                        
                        //add control buttons when slices are drawn.
                    }
                }

                let numSlices = selectedPieMenu.functions.length-1    
                let editButtonSize = 20; 
                let buttonPadding = 0;            

                disp.setActiveCanvas(1);
                for (k in elements){
                    element = elements[k];

                    let selectedSlicePosition;
                    
                    if(element.type == "pieCircle"){                        
                        //draw circle and set region
                        disp.draw.pieCircle(element, centerPos);
                    }
                    else if(element.type == "sliceLabel" && element.isDragging == false){
                        let isSelected = element.isSelected;

                        let thickness = selectedPieMenu.thickness;
                        let pieRadius = selectedPieMenu.radius+(thickness/2);

                        let pieAngleOffset = editPieMenu.selectedPieMenu.pieAngle;
                        let sliceNum = selectedPieMenu.functions.indexOf(element.data)-1;   
                        let sliceAngleCenterOffset = (180/numSlices)              
                        let sliceAngle = (sliceNum*(360/numSlices))+sliceAngleCenterOffset+pieAngleOffset
                        let sliceArcLength = 360/numSlices;
                        let labelRadius = editPieMenu.selectedPieMenu.labelRadius+pieRadius+(thickness/2);                        
                        let labelPosition = [
                            Math.round(centerPos[0]+(labelRadius*Math.cos((sliceAngle-90)*(Math.PI/180)))) ,
                            Math.round(centerPos[1]+(labelRadius*Math.sin((sliceAngle-90)*(Math.PI/180))))
                        ];
                        //Draw Pie Circle Slice Indicator
                        if (isSelected){
                            ctx.lineWidth = thickness                  
                            ctx.strokeStyle = rgbToHex(selectedPieMenu.selectionColor)                  
                            ctx.beginPath();
                            ctx.arc(centerPos[0], centerPos[1], pieRadius, ((sliceAngle-90)-(180/numSlices))*(Math.PI/180), ((sliceAngle-90)+(180/numSlices))*(Math.PI/180));
                            ctx.stroke();  
                            // disp.setActiveCanvas(2)                          
                        }

                        let labelAnchor
                        if (sliceAngle > 0.1 && sliceAngle < 179.9){
                            labelAnchor = [-1,0]
                        } else if (sliceAngle > 180.1 && sliceAngle < 359.9) {
                            labelAnchor = [1,0]
                        } else if (sliceAngle == 0 || sliceAngle == 360) {
                            labelAnchor = [0,0]
                        } else {
                            labelAnchor = [0,0]
                        }
                        let labelData = element.data
                        
                        let labelRect = disp.draw.label(labelData.label, labelData.icon, labelData.hotkey, labelPosition,labelAnchor,element)
                        if (isSelected == true){
                            // disp.setActiveCanvas(1)
                            selectedSliceButtonPosition = [labelRect[0]-buttonPadding-2,labelRect[1]-1];
                        }
                        element.region = {rect:labelRect,arc:null}

                    } else if(element.type == "addSliceBtn"){
                        element.region={rect:[selectedSliceButtonPosition[0]-editButtonSize,selectedSliceButtonPosition[1],editButtonSize,editButtonSize],arc:null}
                        disp.draw.addSliceButton([selectedSliceButtonPosition[0]-editButtonSize,selectedSliceButtonPosition[1],editButtonSize,editButtonSize])
                    } else if(element.type == "deleteSliceBtn"){
                        element.region={rect:[
                            selectedSliceButtonPosition[0]-editButtonSize,
                            selectedSliceButtonPosition[1]+editButtonSize+buttonPadding,
                            editButtonSize,
                            editButtonSize],arc:null}
                        disp.draw.deleteSliceButton([selectedSliceButtonPosition[0]-editButtonSize,selectedSliceButtonPosition[1]+editButtonSize+buttonPadding,editButtonSize,editButtonSize])
                    }
                };                 
                //draw slice labels and set regions
                    //draw selected buttons if slice is selected.                
            },
            addSliceButton:function(rect){                
                let ctx = editPieMenu.pieMenuDisplay.activeCanvas.getContext("2d");
                let rectCenter = [rect[0]+(rect[2]/2),rect[1]+(rect[3]/2)];
                let iconPadding = 5;
                ctx.fillStyle = '#82B67D';            
                ctx.strokeStyle = 'white';                
                ctx.lineWidth = 1;
                ctx.beginPath()
                // roundRect(ctx, rect[0], rect[1], rect[3], rect[4],1,true,true);
                roundRect(ctx, rect[0], rect[1], rect[2], rect[3],1,true,true);
                ctx.lineWidth = 2;

                ctx.moveTo(rectCenter[0],rect[1]+iconPadding)
                ctx.lineTo(rectCenter[0], (rect[1]+rect[3])-iconPadding);
                ctx.moveTo(rect[0]+iconPadding,rectCenter[1]);
                ctx.lineTo((rect[0]+rect[2])-iconPadding,rectCenter[1]);
                ctx.stroke();     
            },
            deleteSliceButton:function(rect){
                let ctx = editPieMenu.pieMenuDisplay.activeCanvas.getContext("2d");
                let rectCenter = [rect[0]+(rect[2]/2),rect[1]+(rect[3]/2)];
                let iconPadding = 5;
                ctx.fillStyle = '#F05B5B';            
                ctx.strokeStyle = 'white';                
                ctx.lineWidth = 1;
                ctx.beginPath()                
                // roundRect(ctx, rect[0], rect[1], rect[3], rect[4],1,true,true);
                roundRect(ctx, rect[0], rect[1], rect[2], rect[3],1,true,true);
                ctx.lineWidth = 2;

                ctx.moveTo(rect[0]+iconPadding,rect[1]+iconPadding)
                ctx.lineTo((rect[0]+rect[2])-iconPadding, (rect[1]+rect[3])-iconPadding);
                ctx.moveTo(rect[0]+iconPadding,(rect[1]+rect[3])-iconPadding);
                ctx.lineTo((rect[0]+rect[2])-iconPadding,rect[1]+iconPadding);
                ctx.stroke();
            }            
        },
        refresh:function(){            
            editPieMenu.pieMenuDisplay.loadPieMenuElements(editPieMenu.selectedPieMenu);
            editPieMenu.appearanceSettings.refreshPieAngle();                      
            editPieMenu.pieMenuDisplay.draw.elements(editPieMenu.pieMenuDisplay.elements);            
        },
        getMouse: function(mouseEvent){
            let canvas = editPieMenu.pieMenuDisplay.canvas
            var cRect = canvas.getBoundingClientRect();        // Gets CSS pos, and width/height
            var canvasX = Math.round(mouseEvent.clientX - cRect.left);  // Subtract the 'left' of the canvas 
            var canvasY = Math.round(mouseEvent.clientY - cRect.top);   // from the X/Y positions to make    
            let position =  [canvasX,canvasY];
            let centerPos = editPieMenu.pieMenuDisplay.centerPos;
            let theta = cycleRange(calcAngle(centerPos[0],centerPos[1],position[0],position[1])+90)
            let dist = Math.sqrt( ((position[0]-centerPos[0])**2) + ((position[1]-centerPos[1])**2) )
            return {
                position: position,
                theta: theta,
                distance: dist
            }     
        },
        getElementUnderMouse: function(mouse){
            let disp = editPieMenu.pieMenuDisplay;
            for (let k in disp.elements){
                let element = disp.elements[k];
                if (element.region.rect != null){                    
                    if(element.region.rect[0] < mouse.position[0] && mouse.position[0] < (element.region.rect[0]+element.region.rect[2]) ){
                        if(element.region.rect[1] < mouse.position[1] && mouse.position[1] < (element.region.rect[1]+element.region.rect[3]) ){
                            return(element);
                        }
                    }
                } else if (element.region.arc != null){
                    let arc = element.region.arc;                    
                    if(arc[2] < mouse.distance && mouse.distance < arc[3]){
                        if(arc[1] < arc[0]){ // region crosses 0, 360
                            if (mouse.theta > arc[0] || mouse.theta < arc[1]){
                                return(element);
                            }                                    
                        }else{
                            if(arc[0] < mouse.theta && mouse.theta < arc[1]){
                                return(element);
                            }
                        }                       
                    }
                }
            }
            return null
        }
        
    },
    launchSettings:{
        activationModeBtn: document.getElementById('change-activation-mode-btn'),
        clickableFunctionsCheckbox: document.getElementById('clickable-functions-checkbox'),
        initialize:function(){              
            this.activationModeBtn.addEventListener('click',function(){                
                changeActivationMode().then(val => {                    
                    let activationModeBtn = editPieMenu.launchSettings.activationModeBtn;
                    editPieMenu.selectedPieKey.activationMode.submenuMode = val;
                    activationModeBtn.innerHTML = subMenuModeDescriptions[val-1];
                    $('[href="#tab-2"]').tab('show');                                
                },val => {
                    $('[href="#tab-2"]').tab('show');
                });                
            });

            let clickableFunctionsCheckbox = this.clickableFunctionsCheckbox
            clickableFunctionsCheckbox.addEventListener('click',function(){                
                editPieMenu.selectedPieKey.activationMode.clickableFunctions = clickableFunctionsCheckbox.checked;
            });         
        },
        loadSelectedPieKey:function(){
            let actMode = editPieMenu.selectedPieKey.activationMode;
            this.activationModeBtn.innerHTML = subMenuModeDescriptions[actMode.submenuMode-1];
            this.clickableFunctionsCheckbox.checked = actMode.clickableFunctions;            
        }
    },
    appearanceSettings:{
        initialize:function(){
            // let selectedPieMenu = editPieMenu.selectedPieMenu;  
            {
                let colorControlElement = this.mainMenu.selectionColorInput;
                colorControlElement.addEventListener('change',function(){
                    editPieMenu.selectedPieMenu.selectionColor = hexToRgb(colorControlElement.value);                    
                    editPieMenu.pieMenuDisplay.refresh();
                })  
            }
            {
                let colorControlElement = this.mainMenu.backgroundColorInput;                
                colorControlElement.addEventListener('change',function(){
                    editPieMenu.selectedPieMenu.backgroundColor = hexToRgb(colorControlElement.value);                    
                    editPieMenu.pieMenuDisplay.refresh();
                })  
            }
            //Radius Slider
            // {
                let sliderDiv = this.mainMenu.radiusSlider; //Change
            //     let sliderRangeInput = sliderDiv.getElementsByClassName('form-range')[0]                
            //     sliderRangeInput.setAttribute('min',0) //Change
            //     sliderRangeInput.setAttribute('max',100) //Change
            //     let sliderTextInput = sliderDiv.getElementsByClassName('bg-dark border rounded-0 border-dark')[0]                             
            //     sliderRangeInput.addEventListener('change',function(event){
            //         let newValue = Math.round(event.target.value);                    
            //         editPieMenu.selectedPieMenu.radius = newValue; //Change                    
            //         sliderTextInput.value = newValue;
            //         // editPieMenu.appearanceSettings.mainMenu.thicknessSlider.getElementsByClassName('form-range')[0].max = newValue;                    
            //         editPieMenu.pieMenuDisplay.refresh();
            //     })
            //     sliderTextInput.setAttribute('oldvalue',0)
            //     sliderTextInput.addEventListener('change',function(event){                    
            //         if(!IsNumeric(event.target.value) || sliderRangeInput.min > parseInt(event.target.value) || parseInt(event.target.value) > sliderRangeInput.max){                        
            //             sliderTextInput.value = sliderTextInput.oldvalue;
            //             return
            //         }
            //         let newValue = Math.round(event.target.value);                    
            //         editPieMenu.selectedPieMenu.radius = newValue; //Change
            //         sliderTextInput.oldvalue = newValue;
            //         sliderRangeInput.value = newValue;
            //         // editPieMenu.appearanceSettings.mainMenu.thicknessSlider.getElementsByClassName('form-range')[0].max = 50;
            //         // editPieMenu.appearanceSettings.mainMenu.thicknessSlider.getElementsByClassName('form-range')[0].max = newValue;
            //         editPieMenu.pieMenuDisplay.refresh();                    
            //     });
            // }

            this.mainMenu.radiusSlider.on('mousedown mousemove change', (event) => {                         
            // $('#main-menu-radius-slider-div').on('mousedown mousemove change', (event) => {
                // let dataObj = editPieMenu.selectedPieMenu.radius
                let newValue = handleSliderDiv(event,0,100);                
                editPieMenu.selectedPieMenu.radius = (newValue) ? newValue : editPieMenu.selectedPieMenu.radius
            });  
         
            function handleSliderDiv(event, min, max, dataThatWontWork, step=1){
                // MouseDownID = -1
                
                let sliderDiv = event.currentTarget;
                let inputSlider = sliderDiv.getElementsByClassName('form-range')[0];                
                let textInput = sliderDiv.getElementsByClassName('bg-dark border rounded-0 border-dark')[0] ;

                
                // console.log(event);
                //run first time only if possible:
                inputSlider.setAttribute('min',min)
                inputSlider.setAttribute('max',max)

                if (event.type == "mousedown" && event.target.nodeName == "INPUT"){ //Moving slider
                    //start setTimeout
                    IsDragging = true;
                }
                if (event.type == "mousemove" && IsDragging){ //Moving slider
                    return updateSliderValue();
                }
                if (event.type == "change"){ //Moved slider or entered number
                    IsDragging=false
                    console.log(event);
                    return updateSliderValue();
                }
                function updateSliderValue(){
                    // console.log("Refreshing");
                    let newValue = Math.round(inputSlider.value);                    
                    editPieMenu.pieMenuDisplay.refresh();
                    return newValue
                };

                
                return //will need return value
            };

            $('#main-menu-thickness-slider-div').on('mousedown mousemove change', (event) => {                         
                let newValue = handleSliderDiv(event,0,69);
                editPieMenu.selectedPieMenu.thickness = (newValue) ? newValue : editPieMenu.selectedPieMenu.thickness
            });            

            $('#main-menu-label-radius-slider-div').on('mousedown mousemove change', (event) => {                         
                let newValue = handleSliderDiv(event,0,150);
                editPieMenu.selectedPieMenu.labelRadius = (newValue) ? newValue : editPieMenu.selectedPieMenu.labelRadius
            });
            // {
            //     let sliderDiv = this.mainMenu.thicknessSlider; //Change
            //     let sliderRangeInput = sliderDiv.getElementsByClassName('form-range')[0]                
            //     sliderRangeInput.setAttribute('min',0) //Change
            //     sliderRangeInput.setAttribute('max',69) //Change
            //     let sliderTextInput = sliderDiv.getElementsByClassName('bg-dark border rounded-0 border-dark')[0]                             
            //     sliderRangeInput.addEventListener('change',function(event){
            //         let newValue = Math.round(event.target.value);                    
            //         editPieMenu.selectedPieMenu.thickness = newValue; //Change                    
            //         sliderTextInput.value = newValue;
            //         editPieMenu.pieMenuDisplay.refresh();
            //     })
            //     sliderTextInput.setAttribute('oldvalue',0)
            //     sliderTextInput.addEventListener('change',function(event){                    
            //         if(!IsNumeric(event.target.value) || sliderRangeInput.min > parseInt(event.target.value) || parseInt(event.target.value) > sliderRangeInput.max){                        
            //             sliderTextInput.value = sliderTextInput.oldvalue;
            //             return
            //         }
            //         let newValue = Math.round(event.target.value);                    
            //         editPieMenu.selectedPieMenu.thickness = newValue; //Change
            //         sliderTextInput.oldvalue = newValue;
            //         sliderRangeInput.value = newValue;
            //         editPieMenu.pieMenuDisplay.refresh();                    
            //     });
            // }
            // {
                // let sliderDiv = this.mainMenu.labelRadiusSlider; //Change
            //     let sliderRangeInput = sliderDiv.getElementsByClassName('form-range')[0]                
            //     sliderRangeInput.setAttribute('min',0) //Change
            //     sliderRangeInput.setAttribute('max',200) //Change
            //     let sliderTextInput = sliderDiv.getElementsByClassName('bg-dark border rounded-0 border-dark')[0]                             
            //     sliderRangeInput.addEventListener('change',function(event){
            //         let newValue = Math.round(event.target.value);                    
                    // editPieMenu.selectedPieMenu.labelRadius = newValue; //Change                    
            //         sliderTextInput.value = newValue;
                    // editPieMenu.pieMenuDisplay.refresh();
            //     })
            //     sliderTextInput.setAttribute('oldvalue',0)
            //     sliderTextInput.addEventListener('change',function(event){
                    
            //         if(!IsNumeric(event.target.value) || sliderRangeInput.min > parseInt(event.target.value) || parseInt(event.target.value) > sliderRangeInput.max){                        
            //             sliderTextInput.value = sliderTextInput.oldvalue;
            //             return
            //         }
            //         let newValue = Math.round(event.target.value);                    
            //         editPieMenu.selectedPieMenu.labelRadius = newValue; //Change
            //         sliderTextInput.oldvalue = newValue;
            //         sliderRangeInput.value = newValue;
            //     });
            // }
            //Main Angle Offset
            this.mainMenu.angleOffsetBtnGroup.addEventListener('click',function(event){ 
                event.stopPropagation()
                event.preventDefault();
                $("#main-angle-offset-btn-group :input").each(function(index, val){                    
                    if(event.target.previousElementSibling && val.name == event.target.previousElementSibling.name){                        
                        val.checked = true                        
                        if (val.name == "offset"){
                            editPieMenu.appearanceSettings.refreshPieAngle(true)                          
                        } else { // == "none"                            
                            editPieMenu.appearanceSettings.refreshPieAngle(false)
                        }                        
                    } else {
                        val.checked = false                            
                    };                    
                })                
                editPieMenu.pieMenuDisplay.refresh();            
            });

            {
                let sliderDiv = this.mainMenu.labelDelaySlider; //Change
                let sliderRangeInput = sliderDiv.getElementsByClassName('form-range')[0]                
                sliderRangeInput.setAttribute('min',0) //Change
                sliderRangeInput.setAttribute('max',50) //Change
                let sliderTextInput = sliderDiv.getElementsByClassName('bg-dark border rounded-0 border-dark')[0]                             
                sliderRangeInput.addEventListener('change',function(event){
                    let newValue = Math.round(event.target.value);                    
                    editPieMenu.selectedPieKey.labelDelay = newValue/10; //Change                    
                    sliderTextInput.value = newValue/10;
                    editPieMenu.pieMenuDisplay.refresh();
                })
                sliderTextInput.setAttribute('oldvalue',0)
                sliderTextInput.addEventListener('change',function(event){
                    
                    if(!IsNumeric(event.target.value) || sliderRangeInput.min > parseInt(event.target.value) || parseInt(event.target.value) > sliderRangeInput.max){                        
                        sliderTextInput.value = sliderTextInput.oldvalue;
                        return
                    }
                    let newValue = event.target.value.toFixed(1);                    
                    editPieMenu.selectedPieKey.labelDelay = newValue; //Change
                    sliderTextInput.oldvalue = newValue;
                    sliderRangeInput.value = newValue*10;           
                });
            }

            //Submenu controls
            {
                let colorControlElement = this.subMenu.selectionColorInput;
                colorControlElement.addEventListener('change',function(){
                    editPieMenu.selectedPieMenu.selectionColor = hexToRgb(colorControlElement.value);                    
                    editPieMenu.pieMenuDisplay.refresh();
                })
            }
            {
                let sliderDiv = this.subMenu.radiusSlider; //Change
                let sliderRangeInput = sliderDiv.getElementsByClassName('form-range')[0]                
                sliderRangeInput.setAttribute('min',0) //Change
                sliderRangeInput.setAttribute('max',100) //Change
                let sliderTextInput = sliderDiv.getElementsByClassName('bg-dark border rounded-0 border-dark')[0]                             
                sliderRangeInput.addEventListener('change',function(event){
                    let newValue = Math.round(event.target.value);                    
                    editPieMenu.selectedPieMenu.radius = newValue; //Change                    
                    sliderTextInput.value = newValue;                    
                    editPieMenu.pieMenuDisplay.refresh();
                })
                sliderTextInput.setAttribute('oldvalue',0)
                sliderTextInput.addEventListener('change',function(event){                    
                    if(!IsNumeric(event.target.value) || sliderRangeInput.min > parseInt(event.target.value) || parseInt(event.target.value) > sliderRangeInput.max){                        
                        sliderTextInput.value = sliderTextInput.oldvalue;
                        return
                    }
                    let newValue = Math.round(event.target.value);                    
                    editPieMenu.selectedPieMenu.radius = newValue; //Change
                    sliderTextInput.oldvalue = newValue;
                    sliderRangeInput.value = newValue;
                    editPieMenu.pieMenuDisplay.refresh();                    
                });
            }
            {
                let sliderDiv = this.subMenu.thicknessSlider; //Change
                let sliderRangeInput = sliderDiv.getElementsByClassName('form-range')[0]                
                sliderRangeInput.setAttribute('min',0) //Change
                sliderRangeInput.setAttribute('max',69) //Change
                let sliderTextInput = sliderDiv.getElementsByClassName('bg-dark border rounded-0 border-dark')[0]                             
                sliderRangeInput.addEventListener('change',function(event){
                    let newValue = Math.round(event.target.value);                    
                    editPieMenu.selectedPieMenu.thickness = newValue; //Change                    
                    sliderTextInput.value = newValue;
                    editPieMenu.pieMenuDisplay.refresh();
                })
                sliderTextInput.setAttribute('oldvalue',0)
                sliderTextInput.addEventListener('change',function(event){                    
                    if(!IsNumeric(event.target.value) || sliderRangeInput.min > parseInt(event.target.value) || parseInt(event.target.value) > sliderRangeInput.max){                        
                        sliderTextInput.value = sliderTextInput.oldvalue;
                        return
                    }
                    let newValue = Math.round(event.target.value);                    
                    editPieMenu.selectedPieMenu.thickness = newValue; //Change
                    sliderTextInput.oldvalue = newValue;
                    sliderRangeInput.value = newValue;
                    editPieMenu.pieMenuDisplay.refresh();                    
                });
            }
            {
                let sliderDiv = this.subMenu.labelRadiusSlider; //Change
                let sliderRangeInput = sliderDiv.getElementsByClassName('form-range')[0]                
                sliderRangeInput.setAttribute('min',0) //Change
                sliderRangeInput.setAttribute('max',150) //Change
                let sliderTextInput = sliderDiv.getElementsByClassName('bg-dark border rounded-0 border-dark')[0]                             
                sliderRangeInput.addEventListener('change',function(event){
                    let newValue = Math.round(event.target.value);                    
                    editPieMenu.selectedPieMenu.labelRadius = newValue; //Change                    
                    sliderTextInput.value = newValue;
                    editPieMenu.pieMenuDisplay.refresh();
                })
                sliderTextInput.setAttribute('oldvalue',0)
                sliderTextInput.addEventListener('change',function(event){
                    
                    if(!IsNumeric(event.target.value) || sliderRangeInput.min > parseInt(event.target.value) || parseInt(event.target.value) > sliderRangeInput.max){                        
                        sliderTextInput.value = sliderTextInput.oldvalue;
                        return
                    }
                    let newValue = Math.round(event.target.value);                    
                    editPieMenu.selectedPieMenu.labelRadius = newValue; //Change
                    sliderTextInput.oldvalue = newValue;
                    sliderRangeInput.value = newValue;
                });
            }
            
            this.subMenu.backFunctionCheckBox.addEventListener('click',function(event){
                if(event.target.checked){
                    //Create and insert Back functionn                    
                    editPieMenu.slice.add(0,{
                        function: "submenu",
                        params: {
                            pieMenuNumber: editPieMenu.findSubMenuParent(),
                            isBack: true
                        },
                        label: "Back",
                        hotkey: "",
                        clickable: false,
                        returnMousePos: false,
                        icon: {
                            filePath: "SubmenuBack.png",
                            WBOnly: true
                            }
                        })
                    //Set Pie Angle?
                    // editPieMenu.appearanceSettings.refreshPieAngle();
                    //Hide Angle buttons
                    $("#sub-menu-angle-offset-div").removeClass()
                    $("#sub-menu-angle-offset-div").hide()
                }else{
                    editPieMenu.slice.delete(1);
                    editPieMenu.appearanceSettings.refreshPieAngle(false);
                    $("#sub-menu-angle-offset-div").addClass('d-flex align-items-center')
                    $("#sub-menu-angle-offset-div").show()                    
                    //Remove back function
                }                
                editPieMenu.pieMenuDisplay.refresh();
            });

            this.subMenu.angleOffsetBtnGroup.addEventListener('click',function(event){   
                event.stopPropagation();
                event.preventDefault();             
                $("#sub-angle-offset-btn-group :input").each(function(index, val){
                    if(event.target.previousElementSibling && val.name == event.target.previousElementSibling.name){ 
                        val.checked = true
                        if (val.name == "offset"){                            
                            editPieMenu.appearanceSettings.refreshPieAngle(true)                          
                        } else { // == "none"                            
                            editPieMenu.appearanceSettings.refreshPieAngle(false)
                        }                        
                    } else {
                        val.checked = false                            
                    };
                });
                editPieMenu.pieMenuDisplay.refresh();            
            });
           
        },        
        loadSelectedPieKey:function(){
            let selectedPieMenu = editPieMenu.selectedPieMenu;
            function setSliderDivValue(sliderDivElement,value){                
                // let sliderRangeInput = sliderDivElement.getElementsByClassName('form-range')[0]
                // let sliderTextInput = sliderDivElement.getElementsByClassName('bg-dark border rounded-0 border-dark')[0]
                // sliderRangeInput.value = value;
                // sliderTextInput.value = value;
                // sliderTextInput.oldvalue = value;
                // sliderTextInput.placeholder = value;  
                let sliderRangeInput = sliderDivElement.children('.form-range')
                let sliderTextInput = sliderDivElement.children('.bg-dark.border.rounded-0.border-dark');
                sliderRangeInput[0].value = value;
                sliderTextInput[0].value = value;
                sliderTextInput[0].oldvalue = value;
                sliderTextInput[0].placeholder = value;                           
            };
            // function setSliderDivValueJ(sliderDivElement,value){
            //     let sliderRangeInput = sliderDivElement.children('.form-range')
            //     let sliderTextInput = sliderDivElement.children('.bg-dark.border.rounded-0.border-dark');
            //     sliderRangeInput[0].value = value;
            //     sliderTextInput[0].value = value;
            //     sliderTextInput[0].oldvalue = value;
            //     sliderTextInput[0].placeholder = value;
            // };
            if(editPieMenu.selectedPieKey.pieMenus.indexOf(editPieMenu.selectedPieMenu) == 0){                
                if(editPieMenu.selectedPieMenu.pieAngle != 0){
                    $('#main-angle-offset-btncheck1').prop('checked', false)
                    $('#main-angle-offset-btncheck2').prop('checked', true)                    
                }else{
                    $('#main-angle-offset-btncheck1').prop('checked', true)                    
                    $('#main-angle-offset-btncheck2').prop('checked', false)                    
                }
                this.mainMenu.selectionColorInput.value = rgbToHex(selectedPieMenu.selectionColor)
                this.mainMenu.backgroundColorInput.value = rgbToHex(selectedPieMenu.backgroundColor)            
                setSliderDivValue(this.mainMenu.radiusSlider,selectedPieMenu.radius);
                setSliderDivValue(this.mainMenu.thicknessSlider,selectedPieMenu.thickness);
                setSliderDivValue(this.mainMenu.labelRadiusSlider,selectedPieMenu.labelRadius);
                setSliderDivValue(this.mainMenu.labelDelaySlider,editPieMenu.selectedPieKey.labelDelay);
            }else{
                if(editPieMenu.selectedPieMenu.pieAngle != 0){
                    $('#sub-angle-offset-btncheck1').prop('checked', false)
                    $('#sub-angle-offset-btncheck2').prop('checked', true)                    
                }else{
                    $('#sub-angle-offset-btncheck1').prop('checked', true)  
                    $('#sub-angle-offset-btncheck2').prop('checked', false)
                                      
                }
                this.subMenu.selectionColorInput.value = rgbToHex(selectedPieMenu.selectionColor)
                setSliderDivValue(this.subMenu.radiusSlider,selectedPieMenu.radius);
                setSliderDivValue(this.subMenu.thicknessSlider,selectedPieMenu.thickness);
                setSliderDivValue(this.subMenu.labelRadiusSlider,selectedPieMenu.labelRadius);
                //Init previous menu value                
                if (editPieMenu.selectedPieMenu.functions[1].params.isBack == true){
                    this.subMenu.backFunctionCheckBox.checked = true
                } else {
                    this.subMenu.backFunctionCheckBox.checked = false                    
                }
            }  
        },
        refreshPieAngle(setIsOffset=null){
            // let pieAngle = editPieMenu.selectedPieMenu.pieAngle
            let isSubmenu = (editPieMenu.selectedPieKey.pieMenus.indexOf(editPieMenu.selectedPieMenu) != 0) ? true : false;
            
            function getParentMenuAngle(parentMenu, pieMenuNumber){                
                for (k in parentMenu.functions){
                    let func = parentMenu.functions[k];
                    if (func.function == "submenu"){
                        if(func.params.pieMenuNumber == pieMenuNumber){                            
                            let parentNumSlices = parentMenu.functions.length-1; 
                            let newMenuNumSlices = editPieMenu.selectedPieMenu.functions.length-1;                           
                            // let parentFuncAngle = (360/parentNumSlices)*(k-1)+parentMenu.pieAngle-((360/newMenuNumSlices)/2);
                            let parentFuncAngle = (360/parentNumSlices)*(k-1)+(180/parentNumSlices)+parentMenu.pieAngle;
                            let backAngle = cycleRange(parentFuncAngle+180-(180/newMenuNumSlices));                          
                            // let parentFuncAngle = (360/parentNumSlices)*(k-1)
                            // console.log("Parent: " + parentFuncAngle)
                            // console.log("back: " + backAngle)
                            
                            return backAngle                                                 
                        }                                
                    }
                }
                return 0
            }
            function findOffsetAngle(){
                let numSlices = editPieMenu.selectedPieMenu.functions.length-1
                return 180/numSlices
            }
            function handleIsOffset(isOffset){
                if (isOffset != null){
                    if (isOffset){
                        editPieMenu.selectedPieMenu.pieAngle = findOffsetAngle();
                    }else{
                        editPieMenu.selectedPieMenu.pieAngle = 0;
                    }
                } else {
                    if (editPieMenu.selectedPieMenu.pieAngle != 0){
                        editPieMenu.selectedPieMenu.pieAngle = findOffsetAngle();
                    }
                    return                                        
                } 
            }
            if (isSubmenu){
                let backExists = editPieMenu.selectedPieMenu.functions[1].params.isBack ? true : false;                
                if(backExists){                    
                    //Set Angle to align back to opposite of previous menu angle
                    let parentMenu = editPieMenu.selectedPieKey.pieMenus[editPieMenu.findSubMenuParent()]
                    let newAngle = getParentMenuAngle(parentMenu, editPieMenu.selectedPieKey.pieMenus.indexOf(editPieMenu.selectedPieMenu))
                    editPieMenu.selectedPieMenu.pieAngle = newAngle;  
                    // console.log(editPieMenu.selectedPieMenu.pieAngle);              
                    return                 
                } else {
                    // Treat as none or offset angle    
                    handleIsOffset(setIsOffset);                
                }         
            }else{
                handleIsOffset(setIsOffset);
            }  
        },
        mainMenu:{
            show:function(){
                mainMenuGroup = document.getElementById('main-menu-appearance-settings');                                
                subMenuGroup = document.getElementById('sub-menu-appearance-settings');
                mainMenuGroup.style.display = "block"                           
                subMenuGroup.style.display = "none"                           
            },
            selectionColorInput:document.getElementById('main-selection-color-input'),
            backgroundColorInput:document.getElementById('main-background-color-input'),            
            radiusSlider:$('#main-menu-radius-slider-div'),
            // radiusSlider:document.getElementById('main-menu-radius-slider-div'),
            thicknessSlider:document.getElementById('main-menu-thickness-slider-div'),
            labelRadiusSlider:document.getElementById('main-menu-label-radius-slider-div'),
            angleOffsetBtnGroup:document.getElementById('main-angle-offset-btn-group'),
            labelDelaySlider:document.getElementById('main-menu-label-delay-slider-div')
        },
        subMenu:{
            show:function(){
                mainMenuGroup = document.getElementById('main-menu-appearance-settings');                                
                subMenuGroup = document.getElementById('sub-menu-appearance-settings');
                mainMenuGroup.style.display = "none"                           
                subMenuGroup.style.display = "block"                
            },
            selectionColorInput:document.getElementById('sub-menu-selection-color-input'),            
            radiusSlider:document.getElementById('sub-menu-radius-slider-div'),
            thicknessSlider:document.getElementById('sub-menu-thickness-slider-div'),
            labelRadiusSlider:document.getElementById('sub-menu-label-radius-slider-div'),
            backFunctionCheckBox:document.getElementById('include-back-function-checkbox'),
            angleOffsetBtnGroup:document.getElementById('sub-angle-offset-btn-group')           
        },
    },
    sliceSettings:{
        sliceLabelTextInput: document.getElementById('slice-label-text-input'),
        sliceLabelIconInput: {
            chooseFileBtn:document.getElementById('slice-icon-choose-file-btn'),
            fileText:document.getElementById('slice-icon-file-display-text'),
            removeIconBtn:document.getElementById('remove-label-icon-btn'),
            greyscaleCheckbox:document.getElementById('icon-greyscale-checkbox')
        },        
        sliceHotkeyBtn: document.getElementById('change-slice-hotkey-btn'),
        sliceRemoveHotkeyBtn:document.getElementById('unset-slice-hotkey-btn'),
        sliceFunction: {
            dropdownBtn: document.getElementById('function-dropdown-btn'),
            dropdownMenu: document.getElementById('function-dropdown-menu'),
            tabs: document.getElementById('function-tabs'),
            sendKey:{
                keysDiv: document.getElementById('send-keys-div'),
                keyButtonGroupTemplate: document.getElementById('send-key-btn-group-template'),               
                timeBetweenKeysDiv: document.getElementById('time-between-keys-input-div'),
            },
            mouseClick:{
                clickBtnGroup: document.getElementById('mouse-click-btn-group'),
                modifierBtnGroup: document.getElementById('mouse-click-modifier-btn-group'),
                dragCheckbox: document.getElementById('mouse-drag-checkbox')                           
            },
            runScript:{
                chooseFileBtn: document.getElementById('run-script-choose-btn'),
                displayText: document.getElementById('run-script-display-text'),
                removeBtn: document.getElementById('remove-script-btn')
            },
            openFolder:{
                chooseFolderBtn: document.getElementById('open-folder-choose-btn'),
                displayText: document.getElementById('open-folder-display-text'),
                removeBtn: document.getElementById('remove-folder-btn')                
            },
            repeatLast:{
                timeoutSliderDiv: document.getElementById('repeat-timeout-slider-input')
            },
            subMenu:{
                editSubMenuBtn: document.getElementById('edit-sub-menu-btn')                
            },                        
            noOptions:{},
            photoshop_cycleTool:{},
            photoshop_toggleLayersByName:{},
            photoshop_cycleBrush:{}
        },
        
        initialize:function(){   
            let disp = editPieMenu.pieMenuDisplay;            
            this.sliceLabelTextInput.addEventListener('change', function(event){
                editPieMenu.selectedSlice.label = event.target.value;                
                disp.refresh();
            });
            this.sliceLabelIconInput.chooseFileBtn.addEventListener('click',function(event){
                let iconFilename = electron.openIconImage()
                if(iconFilename){                    
                    editPieMenu.selectedSlice.icon.filePath = iconFilename; 
                    editPieMenu.selectedSlice.icon.WBOnly = determineGreyscale(getImageFromBuffer(iconFilename));                                       
                }
                function getImageFromBuffer(filename){   
                    let returnImage = false 
                    let imagesHTMLCollection = document.getElementById('image-buffer').getElementsByTagName('img')
                    var images = [].slice.call(imagesHTMLCollection);
                    images.forEach(function(element, index){
                        if (element.src.split('/').slice(-1)[0] == escape(filename)){
                            returnImage = element
                        }                                
                    })
                    return returnImage
                }
                function determineGreyscale(img) {
                    // Create an empty canvas element                    
                    var buffer = document.createElement("canvas");
                    buffer.width = img.width;
                    buffer.height = img.height;
                
                    // Copy the image contents to the canvas
                    var btx = buffer.getContext("2d");
                    btx.drawImage(img, 0, 0);
                    var imgData = btx.getImageData(0,0,buffer.width,buffer.height);
                    var i;
                    for (i = 0; i < imgData.data.length; i += 4) {
                        if(imgData.data[i] == imgData.data[i+1] && imgData.data[i] == imgData.data[i+2]){
                            continue 
                        }else{
                            return false                            
                        }                      
                    }
                    return true
                }
                editPieMenu.sliceSettings.loadSelectedPieKey();
                disp.refresh();
                return
            })
            this.sliceLabelIconInput.fileText
            this.sliceLabelIconInput.removeIconBtn.addEventListener('click',function(event){
               editPieMenu.selectedSlice.icon.filePath = "";
               editPieMenu.sliceSettings.sliceLabelIconInput.fileText.innerHTML = "No icon selected";               
               disp.refresh();                                         
            });
            this.sliceLabelIconInput.greyscaleCheckbox.addEventListener('click',function(event){                
                editPieMenu.selectedSlice.icon.WBOnly = event.target.checked;
                disp.refresh();
            });
            sliceLabelIconGreyscaleCheckbox = document.getElementById('icon-greyscale-checkbox');
            this.sliceHotkeyBtn.addEventListener('click',function(event){
                assignKey(false).then(val => {
                    editPieMenu.selectedSlice.hotkey = val.ahkKey 
                    editPieMenu.sliceSettings.sliceHotkeyBtn.innerHTML = val.displayKey   
                    editPieMenu.sliceSettings.loadSelectedPieKey();  
                    $('[href="#tab-2"]').tab('show');
                }, val => {                   
                    $('[href="#tab-2"]').tab('show');
                });
            });
            this.sliceRemoveHotkeyBtn.addEventListener('click',function(event){
                editPieMenu.selectedSlice.hotkey = "";
                editPieMenu.sliceSettings.loadSelectedPieKey();               
            });

            $('#app-profile-dropdown-items').on('click', 'a', function(event) {
                var appProfileName = this.textContent;
            });

            this.sliceFunction.dropdownBtn.addEventListener('click',function(event){
            });

            this.sliceFunction.dropdownMenu.addEventListener('click',function(event){                

                let selectedFunc = getAHKFunc()                
                editPieMenu.selectedSlice.function = selectedFunc.ahkFunction
                function getAHKFunc(){
                    let functionConfig = AutoHotPieSettings.global.functionConfig;
                    let selectedFuncName = event.target.innerHTML;
                    for(functionProfileIndex in functionConfig){
                        let funcProfile = functionConfig[functionProfileIndex].functions;                    
                        for(funcIndex in funcProfile){
                            let func = funcProfile[funcIndex];
                            if (func.name == selectedFuncName){                                
                                return func
                            }         
                        }
                    }
                    return {
                        name:"None",
                        optionType:"No Options",
                        ahkFunction:"none"
                    }
                };
                function getDefaultParameters(){
                    switch (selectedFunc.optionType){
                        case "Send Key":                            
                            return {
                                keys:[],
                                keyDelay:5
                            }
                            break;
                        case "Mouse Click":
                            //Set Icon for mouse?
                            return {
							button:"right",
							shift:false,
							ctrl:false,
							alt:false,
							drag:true
						}
                            break;
                        case "Run Script":
                            return {
                                filePath:""                                                                
                            }
                            break;
                        case "Open Folder":
                            return {
                                filePath:""                                                                
                            }
                            break;
                        case "Repeat Last":
                            return {
                                timeout:5
                            }
                            break;
                        case "Sub Menu":
                            //Determine unusued pie menu number
                            function determineAvailablePieNumber(){
                                let occupiedPieNumbers = [0]
                                for (let pieMenuIndex in editPieMenu.selectedPieKey.pieMenus){
                                    let pieMenu = editPieMenu.selectedPieKey.pieMenus[pieMenuIndex];                                    
                                    for (let sliceFuncIndex in pieMenu.functions){
                                        let sliceFunc = pieMenu.functions[sliceFuncIndex];                                        
                                        if(sliceFunc.function == "submenu"){                                              
                                            if(!occupiedPieNumbers.includes(sliceFunc.params.pieMenuNumber)){  
                                                if (typeof sliceFunc.params.pieMenuNumber == "number"){
                                                    occupiedPieNumbers.push(sliceFunc.params.pieMenuNumber)                                                    
                                                }                                               
                                            }
                                        }
                                    }
                                }
                                // console.log(occupiedPieNumbers)
                                let vacantPieNumber = 0
                                while(occupiedPieNumbers.includes(vacantPieNumber)){
                                    vacantPieNumber++
                                }
                                return vacantPieNumber
                            };
                            let pieNumber = determineAvailablePieNumber();
                            function createDefaultSubMenu(numSlices){
                                let newPieMenuObj = {
                                    backgroundColor: editPieMenu.selectedPieMenu.backgroundColor,
                                    selectionColor: editPieMenu.selectedPieMenu.selectionColor,
                                    radius:40,
                                    thickness:editPieMenu.selectedPieMenu.thickness,
                                    labelRadius: 80,
                                    pieAngle: 0, //Should be updated later when pie angle is assessed.
                                    functions:[]
                                    }; 
                                for(let i=0; i<=numSlices; i++){
                                    newPieMenuObj.functions.push(
                                        {
                                        function:"none",
                                        params:{},
                                        label:"Slice " + i,
                                        hotkey:"",
                                        clickable:false,
                                        returnMousePos:false,
                                        icon:{							
                                            filePath:"",
                                            WBOnly:false
                                            }
                                        }
                                    )
                                };
                                
                                return newPieMenuObj                            
                            };
                            editPieMenu.selectedPieKey.pieMenus[pieNumber] = createDefaultSubMenu(6)
                            return {pieMenuNumber: pieNumber,isBack: false}
                            break;
                        case "Parameter List":
                            return {
                                parameter:selectedFunc.parameter,
                                list:[]                               
                            }                            
                            break;
                        case "photoshop_cycleTool":
                            return {
                                //This might have to be updated later... fire waiting to happen.
                                toolOptions:["moveTool","artboardTool","marqueeRectTool","marqueeEllipTool","marqueeSingleRowTool","marqueeSingleColumnTool","lassoTool","polySelTool","magneticLassoTool","quickSelectTool","magicWandTool","cropTool","perspectiveCropTool","sliceTool","sliceSelectTool","framedGroupTool","eyedropperTool","3DMaterialSelectTool","colorSamplerTool","rulerTool","textAnnotTool","countTool","spotHealingBrushTool","magicStampTool","patchSelection","recomposeSelection","redEyeTool","paintbrushTool","pencilTool","colorReplacementBrushTool","wetBrushTool","cloneStampTool","patternStampTool","historyBrushTool","artBrushTool","eraserTool","backgroundEraserTool","magicEraserTool","gradientTool","bucketTool","3DMaterialDropTool","blurTool","sharpenTool","smudgeTool","dodgeTool","burnInTool","saturationTool","penTool","freeformPenTool","curvaturePenTool","addKnotTool","deleteKnotTool","convertKnotTool","typeCreateOrEditTool","typeVerticalCreateOrEditTool","typeVerticalCreateMaskTool","typeCreateMaskTool","pathComponentSelectTool","directSelectTool","rectangleTool","roundedRectangleTool","ellipseTool","polygonTool","lineTool","customShapeTool","handTool","rotateTool","zoomTool"],
                                tools:[]
                            }
                            break;
                        default:
                            //includes "No Options"
                            return {}
                            break;
                    }
                }
                editPieMenu.selectedSlice.params = getDefaultParameters();                

                editPieMenu.sliceSettings.loadSelectedPieKey();

                //Create default parameters

            });

            //Send Keystroke
            //Remove button group template and save to var 

            this.sliceFunction.sendKey.keysDiv.addEventListener("click",function(event){
                selKeyObj = editPieMenu.selectedSlice.params
                if(!event.target){
                    return;
                }
                let target;
                if(event.target.nodeName == "I"){
                    
                    target = event.target.parentElement;
                }else{
                    target = event.target;
                }                
                
                if(target.name.slice(0,18) == "send-keystroke-btn"){
                    //Get index
                    let keyIndex = parseInt(target.name.split("-").slice(-1)[0])
                    //Remove or edit
                    
                    if(target.name.split("-")[3]=="remove"){
                        selKeyObj.keys.splice(keyIndex,1)
                        editPieMenu.sliceSettings.loadSelectedPieKey();
                    }else if(target.name.split("-")[3]=="add"){
                        assignKey().then(val => { 
                            selKeyObj.keys.push(val.ahkKey)                            
                            $('[href="#tab-2"]').tab('show');
                            // editPieMenu.sliceSettings.sliceFunction.sendKey.keysDiv.scrollIntoView({behavior:"smooth"});
                            window.scrollTo(0,document.body.scrollHeight);
                            editPieMenu.sliceSettings.loadSelectedPieKey();
                        }, val => {                   
                            $('[href="#tab-2"]').tab('show');
                        });
                    }else{
                        // console.log(getKeyObjFromAhkString(selKeyObj.keys[keyIndex]))
                        assignKey().then(val => {                            
                            selKeyObj.keys[keyIndex] = val.ahkKey                            
                            $('[href="#tab-2"]').tab('show');
                            // editPieMenu.sliceSettings.sliceFunction.sendKey.keysDiv.scrollIntoView({behavior:"smooth"});
                            window.scrollTo(0,document.body.scrollHeight);
                            editPieMenu.sliceSettings.loadSelectedPieKey();                            
                        }, val => {                   
                            $('[href="#tab-2"]').tab('show');
                            
                        });
                    }                    
                }
            });

            {             
                let sliderDiv = this.sliceFunction.sendKey.timeBetweenKeysDiv;               
                let sliderRangeInput = sliderDiv.getElementsByClassName('form-range')[0]                
                sliderRangeInput.setAttribute('min',0) //Change
                sliderRangeInput.setAttribute('max',500) //Change
                let sliderTextInput = sliderDiv.getElementsByClassName('bg-dark border rounded-0 border-dark')[0]                             
                sliderRangeInput.addEventListener('change',function(event){
                    let newValue = Math.round(event.target.value);                    
                    editPieMenu.selectedSlice.params.keyDelay = newValue/100; //Change
                    sliderTextInput.value = newValue/100;                    
                })
                sliderTextInput.setAttribute('oldvalue',0)
                sliderTextInput.addEventListener('change',function(event){                    
                    if(!IsNumeric(event.target.value) || sliderRangeInput.min > parseInt(event.target.value) || parseInt(event.target.value) > sliderRangeInput.max){                        
                        sliderTextInput.value = sliderTextInput.oldvalue;
                        return
                    }
                    let newValue = event.target.value.toFixed(1);                    
                    editPieMenu.selectedSlice.params.keyDelay = newValue; //Change
                    sliderTextInput.oldvalue = newValue;
                    sliderRangeInput.value = newValue*10;           
                });
            }

            //Mouse Click
            this.sliceFunction.mouseClick.clickBtnGroup.addEventListener('click',function(event){
                $("#mouse-click-btn-group :input").each(function(index, val){                     
                    // console.log(event.target.previousElementSibling.name)            
                    if(val.name == event.target.previousElementSibling.name){
                        val.checked = true
                        editPieMenu.selectedSlice.params.button = event.target.previousElementSibling.name;
                    } else {
                        val.checked = false                            
                    };
                });

            
            });
            this.sliceFunction.mouseClick.modifierBtnGroup.addEventListener('click',function(event){
                $("#mouse-click-modifier-btn-group :input").each(function(index, val){
                    if(event.target.previousElementSibling.name == val.name){                        
                        val.checked = !val.checked;
                    }                                          
                    if(index == 0){
                        editPieMenu.selectedSlice.params.shift = val.checked;
                    }else if (index == 1){
                        editPieMenu.selectedSlice.params.ctrl  = val.checked;
                    }else if (index == 2){
                        editPieMenu.selectedSlice.params.alt = val.checked;                           
                    }
                });                   
            });

            this.sliceFunction.mouseClick.dragCheckbox.addEventListener('click',function(event){                
                editPieMenu.selectedSlice.params.drag = event.target.checked;
            })

            //Run Script
            this.sliceFunction.runScript.chooseFileBtn.addEventListener('click',function(event){
                let scriptFilename = electron.openScriptFile()
                if(scriptFilename){                    
                    editPieMenu.selectedSlice.params.filePath = scriptFilename;   
                    editPieMenu.sliceSettings.sliceFunction.runScript.displayText.innerHTML = scriptFilename;           
                }
                return
            })            
            this.sliceFunction.runScript.removeBtn.addEventListener('click',function(event){
                editPieMenu.selectedSlice.params.filePath = "";
                editPieMenu.sliceSettings.sliceFunction.runScript.displayText.innerHTML = "No file selected";
             });

             //Open Folder
             this.sliceFunction.openFolder.chooseFolderBtn.addEventListener('click', () => {
                let folderPath = electron.openFolderDialog()
                if(folderPath){                    
                    editPieMenu.selectedSlice.params.filePath = folderPath;   
                    editPieMenu.sliceSettings.sliceFunction.openFolder.displayText.innerHTML = folderPath;           
                }
                return
             });
            //  this.sliceFunction.openFolder.displayText
            this.sliceFunction.openFolder.removeBtn.addEventListener('click', () => {
                editPieMenu.selectedSlice.params.filePath = "";
                editPieMenu.sliceSettings.sliceFunction.openFolder.displayText.innerHTML = "No folder selected";
            });

             //Repeat Last
             {             
                let sliderDiv = this.sliceFunction.repeatLast.timeoutSliderDiv;   
                let decimalStep = 1;            
                let sliderRangeInput = sliderDiv.getElementsByClassName('form-range')[0]                
                sliderRangeInput.setAttribute('min',0) //Change
                sliderRangeInput.setAttribute('max',100) //Change
                let sliderTextInput = sliderDiv.getElementsByClassName('bg-dark border rounded-0 border-dark')[0]                             
                sliderRangeInput.addEventListener('change',function(event){
                    let newValue = Math.round(event.target.value);                    
                    editPieMenu.selectedSlice.params.timeout = newValue/(Math.pow(10,decimalStep)); //Change
                    sliderTextInput.value = newValue/(Math.pow(10,decimalStep));                  
                })
                sliderTextInput.setAttribute('oldvalue',0)
                sliderTextInput.addEventListener('change',function(event){                    
                    if(!IsNumeric(event.target.value) || sliderRangeInput.min > parseInt(event.target.value) || parseInt(event.target.value) > sliderRangeInput.max){                        
                        sliderTextInput.value = sliderTextInput.oldvalue;
                        return
                    }
                    let newValue = event.target.value.toFixed(1);                    
                    editPieMenu.selectedSlice.params.timeout = newValue; //Change
                    sliderTextInput.oldvalue = newValue;
                    sliderRangeInput.value = newValue*(Math.pow(10,decimalStep))           
                });
            }

            //Submenu
            this.sliceFunction.subMenu.editSubMenuBtn.addEventListener('click', function(){
                editPieMenu.selectPieMenu(editPieMenu.selectedSlice.params.pieMenuNumber)
                $('[href="#tab-9"]').tab('show');
            });

        },
        loadSelectedPieKey:function(){
            let selectedSlice = editPieMenu.selectedSlice;            
            this.sliceLabelTextInput.value = selectedSlice.label;
            

            if (editPieMenu.selectedSlice.icon.filePath == ""){
                this.sliceLabelIconInput.fileText.setAttribute('class','text-muted')
                this.sliceLabelIconInput.fileText.innerHTML = "No icon selected"
            }else{
                this.sliceLabelIconInput.fileText.removeAttribute('class')                                                            
                this.sliceLabelIconInput.fileText.innerHTML = editPieMenu.selectedSlice.icon.filePath
            }
            
            this.sliceLabelIconInput.greyscaleCheckbox.checked = editPieMenu.selectedSlice.icon.WBOnly
            
            if(editPieMenu.selectedSlice.hotkey == ""){
                this.sliceHotkeyBtn.innerHTML = "Assign Function Hotkey";
                editPieMenu.sliceSettings.sliceRemoveHotkeyBtn.style.visibility = "hidden";
            }else{
                this.sliceHotkeyBtn.innerHTML = editPieMenu.selectedSlice.hotkey;
                editPieMenu.sliceSettings.sliceRemoveHotkeyBtn.style.visibility = "visible";
            }



            
            selectedSliceFunction = getSelectedFunction()
            if(editPieMenu.selectedPieMenu.functions.indexOf(editPieMenu.selectedSlice) == 0){            
                //Hide Label, icon and Slice hotkey controls
                $('#pie-menu-display-description').show()
                $('#slice-label-div').hide()
                $('#icon-label-div').hide()
                $('#slice-hotkey-div').hide()
            }else{
                //Show Label, icon and Slice hotkey controls
                $('#pie-menu-display-description').hide()
                $('#slice-label-div').show()
                $('#icon-label-div').show()
                $('#slice-hotkey-div').show()
            }
            this.sliceFunction.dropdownBtn.innerHTML = selectedSliceFunction.name;
            //Show tab corresponding to option type
            showTabByName(selectedSliceFunction.optionType)
            function showTabByName(name){                
                let tabNames = editPieMenu.sliceSettings.sliceFunction.tabs.getElementsByClassName('nav-link')
                for(tabNameIndex in tabNames){
                    let tab = tabNames[tabNameIndex];
                    if(tab.nodeName == "A"){                        
                        if(tab.innerHTML == name){                            
                            $('[href="' + tab.getAttribute('href') + '"]').tab('show');                                                            
                        }
                    }
                }
            };

            function setSliderDivValue(sliderDivElement,value,decimalStep=0){                
                let sliderRangeInput = sliderDivElement.getElementsByClassName('form-range')[0]
                let sliderTextInput = sliderDivElement.getElementsByClassName('bg-dark border rounded-0 border-dark')[0]
                sliderRangeInput.value = value*Math.pow(10,decimalStep);
                sliderTextInput.value = value;
                sliderTextInput.oldvalue = value*Math.pow(10,decimalStep);
                sliderTextInput.placeholder = value;                              
            };

            function getSelectedFunction(){
                let functionConfig = AutoHotPieSettings.global.functionConfig;
                let selectedAHKFunc = editPieMenu.selectedSlice.function;
                for(functionProfileIndex in functionConfig){
                    let funcProfile = functionConfig[functionProfileIndex].functions;                    
                    for(funcIndex in funcProfile){
                        let func = funcProfile[funcIndex];
                        if (func.ahkFunction == selectedAHKFunc){
                            return func
                        }         
                    }
                }
                return {
                    name:"None",
                    optionType:"No Options",
                    ahkFunction:"none"
                }
            };
            this.sliceFunction.dropdownMenu.innerHTML = "";  
            //Populate dropdown options          
            AutoHotPieSettings.global.functionConfig[0].functions.forEach(function(sliceFunction,index){            
                let appProfileOption = document.createElement("a");
                appProfileOption.setAttribute("id","slice-function-item");
                appProfileOption.setAttribute("class","dropdown-item");
                appProfileOption.text = sliceFunction.name;
                editPieMenu.sliceSettings.sliceFunction.dropdownMenu.appendChild(appProfileOption);
            })
            

            let selectedFunc = this.sliceFunction.dropdownBtn.innerHTML
            let ahkParamObj = {}
            switch (selectedFunc){
                case "Send Key":
                    ahkParamObj = selectedSlice.params
                    function addKeystrokeButtonGroup(hotkeyObj, index){
                        let btnClone = editPieMenu.sliceSettings.sliceFunction.sendKey.keyButtonGroupTemplate.cloneNode(true);
                        btnClone.children[0].setAttribute('name','send-keystroke-btn-' + index)
                        btnClone.children[0].innerHTML = hotkeyObj.displayKey;
                        btnClone.children[1].setAttribute('name','send-keystroke-btn-remove-' + index)                        
                        $('#send-key-add-keystroke-btn').before(btnClone);                        
                    }

                    //refresh key buttons
                    $('#send-keys-div [class="btn-group"]').remove()
                    if (ahkParamObj.keys.length == 0){
                        $('#send-keys-div [name="send-keystroke-btn-0"]')[0].innerHTML = "Assign Key"                   
                    }
                    ahkParamObj.keys.forEach(function(val, index){
                        let p_HotkeyObj = getKeyObjFromAhkString(val);
                        if(index == 0){
                            $('#send-keys-div [name="send-keystroke-btn-0"]')[0].innerHTML = p_HotkeyObj.displayKey
                        } else {                            
                            addKeystrokeButtonGroup(p_HotkeyObj,index)
                        }                        
                    });
                    setSliderDivValue(editPieMenu.sliceSettings.sliceFunction.sendKey.timeBetweenKeysDiv,ahkParamObj.keyDelay)

                    

                    break;
                case "Mouse Click":
                    ahkParamObj = selectedSlice.params; 

                    $("#mouse-click-btn-group :input").each(function(index, val){                        
                        if(val.name == ahkParamObj.button){
                            val.checked = true;
                        }else{
                            val.checked = false                          
                        }
                    });
                    
                    $("#mouse-click-modifier-btn-group :input").each(function(index, val){                        
                        if(index == 0){
                            val.checked = ahkParamObj.shift;
                        }else if (index == 1){
                            val.checked = ahkParamObj.ctrl;
                        }else if (index == 2){
                            val.checked = ahkParamObj.alt;                           
                        }
                    });

                    editPieMenu.sliceSettings.sliceFunction.mouseClick.dragCheckbox.checked = ahkParamObj.drag
                    
                    break;
                case "Run Script":
                    ahkParamObj = selectedSlice.params;
                    let scriptControl = editPieMenu.sliceSettings.sliceFunction.runScript;
                    
                    if (ahkParamObj.filePath == ""){
                        // scriptControl.displayText.setAttribute('class','text-muted');
                        scriptControl.displayText.innerHTML = "No file selected";
                    }else{
                        // scriptControl.displayText.removeAttribute('class');                              
                        scriptControl.displayText.innerHTML = editPieMenu.selectedSlice.params.filePath;                
                    }


                    break;
                case "Open Folder":
                    ahkParamObj = selectedSlice.params;
                    let folderControl = editPieMenu.sliceSettings.sliceFunction.openFolder;                    
                    if (ahkParamObj.filePath == ""){
                        // scriptControl.displayText.setAttribute('class','text-muted');
                        folderControl.displayText.innerHTML = "No file selected";
                    }else{
                        // scriptControl.displayText.removeAttribute('class');                              
                        folderControl.displayText.innerHTML = editPieMenu.selectedSlice.params.filePath;                
                    }
                    break;
                case "Repeat Last":
                    ahkParamObj = selectedSlice.params;
                    setSliderDivValue(editPieMenu.sliceSettings.sliceFunction.repeatLast.timeoutSliderDiv,ahkParamObj.timeout, 1)
                    break;
                case "Sub Menu":
                    break;
                case "No Options":
                    break;
                case "Parameter List":
                    break;
                case "photoshop_cycleTool":
                    break;
                default:
                    break;
            }             
            

        }
    }
}

editPieMenu.initialize();