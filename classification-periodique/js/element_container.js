//======================================
//   Création des éléments chimiques
//======================================

// dimensions des rectangles pour les éléments chimiques
const elementRectangleWidth = 70;
const elementRectangleHeight = 95;

function createElementContainer(x, y, symbol, elementName, atomicMass) {
    /*
        Crée un conteneur dans lequel sont placés les éléments
        décrivant un élément chimique :
            - symbole chimique ;        - nom de l'élément ;
            - masse atomique.
    */
    
    // création du conteneur
    let container = new createjs.Container();
    container.cursor = 'grab';
    container.x = x;
    container.y = y;
    container.zIndex = 2;
    container.name = "elementContainer_" + symbol;
    
    // ajout des caractéristiques de l'élément chimique
    container.addChild(createElementRectangle(symbol));
    container.addChild(createElementSymbol(symbol, symbol));
    container.addChild(createElementName(elementName, symbol));
    container.addChild(createAtomicMass(atomicMass, symbol));
    
    // déplacement du conteneur
    container.addEventListener("mousedown", mouseDownMove);
    container.addEventListener("pressmove", pressMoveMove);
    container.addEventListener("pressup", pressUpLine);

    return container;
}

function createElementRectangle(elementSymbol) {
    /*
        Cette fonction crée un rectangle dans lequel sont
        contenues les informations sur l'élément chimique.
    */
    elementRectangle = new createjs.Shape();
    elementRectangle.graphics.ss(3, 1, 1).s('black').f('white');
    elementRectangle.graphics.rect(0, 0, elementRectangleWidth, elementRectangleHeight);
    elementRectangle.name = "rectangle_" + elementSymbol;
    return elementRectangle;
}

function createText(x, y, type, font, text, id) {
    /*
        Cette fonction crée un texte à la position (x, y).
    */
    object = new createjs.Text(text, font, 'black');
    object.textAlign = 'center';
    object.x = x;
    object.y = y;
    object.name = type + "_" + id;
    return object;
}

/*
    Ces fonctions permettent de créer les textes donnant les informations
    sur les éléments chimiques :
        - symbole chimique ;            - nom de l'élément ;
        - numéro atomique ;             - masse atomique.
*/
const createElementSymbol = createText.bind(null, elementRectangleWidth/2, 17, "symbol", "20px Quicksand");
const createElementName = createText.bind(null, elementRectangleWidth/2, 40, "name", "11px Quicksand");
const createAtomicNumber = createText.bind(null, 12, 8, "atomicNumber", "11px Quicksand");
const createAtomicMass = createText.bind(null, elementRectangleWidth/2, 55, "atomicMass", "11px Quicksand");

function createInfoIcon(elementSymbol) {
    /*
        Cette fonction crée une icône d'information qui
        permet d'afficher les informations sur l'élément
        chimique.
    */
    infoIcon = new createjs.Container();
    infoIcon.x = elementRectangleWidth/2;
    infoIcon.y = 80;
    infoIcon.name = "infoIcon_" + elementSymbol;
    
    infoCircle = new createjs.Shape();
    infoCircle.graphics.f('black').dc(0, 0, 8).ef().es();
    infoIcon.addChild(infoCircle);

    infoSymbol = new createjs.Text("i", "10px Spectral", 'white');
    infoSymbol.textAlign = 'center';
    infoSymbol.fontStyle = 'italic';
    infoSymbol.y = -3;
    infoIcon.addChild(infoSymbol);
        
    return infoIcon;
}

function createInfoContainer(infoText, elementSymbol) {
    /*
        Cette fonction crée le conteneur dans lequel
        se trouvent les informations sur l'élément chimique.
    */
    infoContainer = new createjs.Container();
    infoContainer.name = "infoContainer_" + elementSymbol;
    infoContainer.x = elementRectangleWidth/2;
    infoContainer.y = elementRectangleHeight + 15;
    infoContainer.zIndex = 1;
    
    infoText = new createjs.Text(infoText, "14px Quicksand", 'black');
    infoText.textAlign = 'center';
    infoText.lineWidth = 265;
    infoText.y = 10;
    
    width = infoText.lineWidth;
    height = infoText.getMeasuredHeight();
    
    infoShape = new createjs.Shape();
    infoShape.graphics.ss(2, 1, 1).s('black').f('white');
    infoShape.graphics.mt(0, -10);
    infoShape.graphics.lt(-10, 0).lt(-width/2-10, 0).lt(-width/2-10, height+20);
    infoShape.graphics.lt(width/2+10, height+20).lt(width/2+10, 0).lt(10,0).lt(0,-10);
    infoShape.x = 0;
    infoShape.y = 0;
    
    infoContainer.addChild(infoShape);
    infoContainer.addChild(infoText);
    
    return infoContainer;
}

function createHighlightRectangle() {
    /*
        Cette fonction crée un rectangle dans lequel sont
        contenues les informations sur l'élément chimique.
    */
    const rectangle = new createjs.Shape();
    rectangle.graphics.ss(3, 1, 1).s('red');
    rectangle.graphics.rect(0, 0, elementRectangleWidth, elementRectangleHeight);
    return rectangle;
}

function createBackgroundRectangle(color) {
    /*
        Cette fonction crée un rectangle dans lequel sont
        contenues les informations sur l'élément chimique.
    */
    const rectangle = new createjs.Shape();
    rectangle.graphics.ss(3, 1, 1).f(color);
    rectangle.graphics.rect(0, 0, elementRectangleWidth, elementRectangleHeight);
    return rectangle;
}



// ===== Écouteurs =====

function mouseDownMove(event) {
    let object = event.currentTarget;
    object.offsetX = object.x - event.stageX;
    object.offsetY = object.y - event.stageY;
    object.cursor = 'grabbing';
    stage.setChildIndex(object, stage.children.length-1);
    stage.update();
}

function pressMoveMove(event) {
    /*
        Cette fonction déplace l'élément chimique sélectionné.
    */
    let object = event.currentTarget;
    object.x = Math.min(Math.max(5, event.stageX + object.offsetX), 1095-elementRectangleWidth);
    object.y = Math.min(Math.max(5, event.stageY + object.offsetY), 370);
    stage.update();
}

function pressUpMove(wrapper, event) {
    let object = event.currentTarget;
    cursor = 'grab';
    object.cursor = 'grab';

    wrapper(object);
    
    stage.update();
}

const pressUpLine = pressUpMove.bind(null, stickToLine);
function stickToLine(object) {
    if (Math.abs(object.y - yTableStart) < 20) {
        for (i = 0; i < elementsNumber; i++) {
            if (Math.abs(object.x - (xTableStart + i * elementRectangleWidth)) < 20) {
                object.x = xTableStart + i * elementRectangleWidth;
                object.y = yTableStart;
                stage.setChildIndex(object, 1);
                break;
            }
        }
    }
}

const pressUpPeriodicTable = pressUpMove.bind(null, stickToPeriodicTable);
function stickToPeriodicTable(object) {
    if (Math.abs(object.y - yTableStart) < 20) {
        for (i = 0; i < elementsNumber/2; i++) {
            if (Math.abs(object.x - (xTableStart + i * elementRectangleWidth)) < 20) {
                object.x = xTableStart + i * elementRectangleWidth;
                object.y = yTableStart;
                stage.setChildIndex(object, 1);
                break;
            }
        }
    } else if (Math.abs(object.y - (yTableStart+elementRectangleHeight)) < 20) {
        for (i = 0; i < elementsNumber/2; i++) {
            if (Math.abs(object.x - (xTableStart + i * elementRectangleWidth)) < 20) {
                object.x = xTableStart + i * elementRectangleWidth;
                object.y = yTableStart + elementRectangleHeight;
                stage.setChildIndex(object, 1);
                break;
            }
        }
    }
}

function highlightElement(event) {
    container = event.currentTarget;
    if (selectedElements.length == 2) {
        return;
    }
    
    let symbol = container.name.substr(17);
    if (selectedElements.includes(symbol)) {
        return;
    }
    selectedElements.push(symbol);

    container.addChild(highlightRectangles[selectedElements.indexOf(symbol)]);
    stage.setChildIndex(container, stage.children.length-1);
    stage.update();

    container.addEventListener("mousedown", deleteHighlight);    
    container.removeEventListener("mousedown", highlightElement);
}

function deleteHighlight(event) {
    container = event.currentTarget;
    let symbol = container.name.substr(17);
    if (selectedElements.includes(symbol)) {
        let index = selectedElements.indexOf(symbol);
        selectedElements.splice(index, 1);
        container.removeChild(highlightRectangles[index]);
        stage.setChildIndex(container, stage.getChildIndex(container)-1);
        stage.update();
        
        if (index == 0) {
            temp = highlightRectangles[0];
            highlightRectangles[0] = highlightRectangles[1];
            highlightRectangles[1] = temp;
        }

        container.addEventListener("mousedown", highlightElement);
        container.removeEventListener("mousedown", deleteHighlight);
    }
}