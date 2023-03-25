// References
var divFriendlies = document.getElementById("row-friendlies");
var divEnemies = document.getElementById("row-enemies");
var divCombatLogHeaders = document.getElementById("row-combat-log-header");
var divCombatLog = document.getElementById("card-combat-log");
var divCombatLogCol = document.getElementById("col-combat-log");
var divPanelCol = document.getElementById("col-panel");

var inputInstanceID = document.getElementById("instance-id-filter");
var showDmgFilter = document.getElementById("checkbox-checked-dmg");
var showHealFilter = document.getElementById("checkbox-checked-heal");
var showBuffFilter = document.getElementById("checkbox-checked-buff");
var showEnergyFilter = document.getElementById("checkbox-checked-energy");
var showAnimFilter = document.getElementById("checkbox-checked-anim");
var showTagFilter = document.getElementById("checkbox-checked-tag");
var showJsonFilter = document.getElementById("checkbox-checked-json");
var movePanelToLeft = document.getElementById("checkbox-checked-move-panel");

var characterFilters = null;

// Combat log data
var combatLog = null;
var friendlies = null;
var enemies = null;
var playerId = null;
var enemyId = null;
var combatId = null;

// Display data
var dgpNames = [];
var dgpShortenNames = [];

// Filter
var selectedDGPs = [];
var selectedInstanceID = [];

// Enums
const EventID = Object.freeze({
    Movement : 1,
    Attacking : 2,
    TakeDamage : 3,
    Death : 4,
    SpawnProjectile : 5,
    UseSkill : 6,
    UseUltimate : 7,
    StatusEffect : 8,
    EnergyUpdate : 9,
    MatchEnd : 10,
    StunEnd: 13
});

const EventName = Object.freeze({
    1 : "Movement",
    2 : "Attacking",
    3 : "Take Damage",
    4 : "Death",
    5 : "Spawn Projectile",
    6 : "Use Skill",
    7 : "Use Ultimate",
    8 : "Status Effect",
    9 : "Energy Update",
    10 : "Game End",
    13 : "Stun End", // not supposed to be included. poop
});

function initialise() {

    var jsonFile = window.jsonFile;

    if (jsonFile == null) {
        // Idiota
        console.error("Combat log is empty. 💩💩💩");
        return false;
    }

    // Clear out array first
    while (dgpNames.length > 0) {
        dgpNames.pop();
    }

    while (dgpShortenNames.length > 0) {
        dgpShortenNames.pop();
    }

    while (selectedDGPs.length > 0) {
        selectedDGPs.pop();
    }

    while (selectedInstanceID.length > 0) {
        selectedInstanceID.pop();
    }

    combatLog = jsonFile.combatLog;
    friendlies = jsonFile.characters[0].id != 1 ? jsonFile.characters.reverse() : jsonFile.characters; 
    enemies = jsonFile.enemy[0].id != 6 ? jsonFile.enemy.reverse() : jsonFile.enemy;
    playerId = jsonFile.playerId;
    enemyId = jsonFile.opponentId;
    combatId = jsonFile.combatId;

    resetContainers();

    // Fill up left side container
    addCharacters(friendlies);
    addCharacters(enemies, true);
    addCombatLog(combatLog);

    characterFilters = document.getElementsByClassName("character-filter");
}

function addCharacters(characters, isEnemy = false) {
    var container = document.createElement("div");
    container.classList.add("container");

    characters.forEach((character) => {
        // By default, show all character logs
        selectedDGPs.push(character.id);

        // DGP name
        dgpNames[character.id] = character.name;
        dgpShortenNames[character.id] = isEnemy ? `${character.name.split("- enemy")[0]}` : `${character.name.split("- friendly")[0]}`

        // Columns
        var col = document.createElement("div");
        col.classList.add("col-2");

        // Buttons for each character with it's max HP.
        var btn = document.createElement("button");
        // btn.innerHTML = `${dgpShortenNames[character.id]} - ${character.hp} HP`;
        btn.innerHTML = `${dgpShortenNames[character.id]} - ${character.id}`;
        btn.classList.add("btn", "btn-xs", isEnemy ? "btn-danger" : "btn-success", "character-filter");
        btn.type = "button";
        btn.index = character.id;

        isEnemy ? divEnemies.appendChild(col) : divFriendlies.appendChild(col);
        col.appendChild(btn);

        btn.addEventListener("click", (evt) => {
            var characterID = evt.target.index;

            // Find if character is in the filtering array.
            var cid = _.find(selectedDGPs, (cid) => { return characterID == cid ? cid : 0; });

            // Exist, remove and don'tshow character logs in viewer.
            if (cid > 0) {
                selectedDGPs = _.pull(selectedDGPs, characterID);

                evt.target.classList.remove(isEnemy ? "btn-danger" : "btn-success");
                evt.target.classList.add(window.useDarkMode.checked ? "btn-outline-light" : "btn-outline-dark");
            }
            // Does not exist, add and show character logs in viewer.
            else {
                selectedDGPs.push(characterID);

                evt.target.classList.add(isEnemy ? "btn-danger" : "btn-success");
                evt.target.classList.remove(window.useDarkMode.checked ? "btn-outline-light" : "btn-outline-dark");
            }

            resetContainers(false, false, true);
            addCombatLog(combatLog);
        });
    });
}

function addCombatLog(combatLog) {
    var dgpSlotId = -1;
    var dgpName = "";
    var dgpNftID = "";
    var instanceID = "";
    var timestamp = "";
    var duration = undefined;
    var tags = [];

    var isMatchEndLog = false;

    var showDamage = showDmgFilter.checked;
    var showHeals = showHealFilter.checked;
    var showBuffs = showBuffFilter.checked;
    var showEnergyUpdate = showEnergyFilter.checked;
    var showAnims = showAnimFilter.checked;
    var showTags = showTagFilter.checked;

    combatLog.forEach((log) => {

        dgpSlotId = log.characterID ? log.characterID : log.event.characterID;
        dgpName = dgpNames[dgpSlotId];
        instanceID = log.event ? log.event.instanceID : log.instanceID ? log.instanceID : undefined;
        timestamp = log.timestamp;
        tags = log.event ? log.event.tag : undefined;

        // Show only selected instance IDs
        if (!filterByInstanceID(instanceID))
            return;

        // Show only selected DGPs
        if (!filterByCharacterID(dgpSlotId) && log.eventID != EventID.MatchEnd)
            return;

        // Show/Hide damage and/or heals
        if (log.eventID == EventID.TakeDamage && ((!showDamage && !_.startsWith(log.event.damageAmount, "-")) || (!showHeals && _.startsWith(log.event.damageAmount, "-"))))
            return;

        // Show/Hide energy update events (This is only used for position #4 buff)
        if (log.eventID == EventID.EnergyUpdate && !showEnergyUpdate)
            return;

        // Show/Hide animation events
        if (!instanceID && _.endsWith(log.log, "animation.") && !showAnims)
            return;

        // Show/Hide buffs
        if (log.eventID == EventID.StatusEffect && !showBuffs)
            return;

        // Row
        var row = document.createElement("div");
        row.classList.add("row", window.useDarkMode.checked ? "border-light" : "border-dark", "border-bottom", "border-opacity-10");
        row.setAttribute("id", "log-entry");

        // Logs
        var colLog = createTextLog(false, log.log, "log", showTags ? "col-5" : "col-6", "border-dark", "border-end");
        var colDmgHealDur = undefined;
        var colTargetHP = undefined;
        var colAttackerEnergy = undefined;
        var colTargetEnergy = undefined;
        var colInstanceID = createTextLog(true, instanceID ? `_${instanceID.toString()}` : "", "instanceID", "col-1", "border-dark", "border-end");
        
        var colTimestamp = undefined;

        if (showTagFilter.checked)
            colTimestamp = createTextLog(true, timestamp.toString(), "timestamp", "col-1", "border-dark", "border-end");
        else
            colTimestamp = createTextLog(true, timestamp.toString(), "timestamp", "col-1");

        if (tags != undefined && showTags)
            var colTags = createDropDownLog(tags, "col-1")

        divCombatLog.append(row);

        // Do not append the col-6 log for match end event.
        if (log.eventID != EventID.MatchEnd)
            row.append(colLog);

        switch(log.eventID) {
            case EventID.Movement: { // Movement
                break;
            }
            case EventID.Attacking: { // Attacking
                // Animation event
                if (!log.event)
                    break;

                colAttackerEnergy = createTextLog(true, `${log.event.energyAmount} (${dgpSlotId})`, "cenergy", "col-1", "border-dark", "border-end");
                break;
            }
            case EventID.TakeDamage: { // Take Damage
                colDmgHealDur = createTextLog(true, log.event.damageAmount.toString(), "damage", "col-1", "border-dark", "border-end");
                colTargetHP = createTextLog(true, log.event.hp.toString(), "targetHP", "col-1", "border-dark", "border-end");
                colAttackerEnergy = createTextLog(true, `${log.event.attackerEnergy} (${dgpSlotId})`, "cenergy", "col-1", "border-dark", "border-end");
                colTargetEnergy = createTextLog(true, `${log.event.targetEnergy} (${log.event.targetID})`, "tenergy", "col-1", "border-dark", "border-end");
                break;
            }
            case EventID.Death: { // Death
                colAttackerEnergy = createTextLog(true, `${log.event.attackerEnergy} (${log.event.attackerID})`, "cenergy", "col-1", "border-dark", "border-end");
                break;
            }
            case EventID.SpawnProjectile: { // Spawn Projectile
                break;
            }
            case EventID.UseSkill: { // Use Skill
                // Animation event
                if (!log.event)
                    break;

                colAttackerEnergy = createTextLog(true, `${log.event.characterEnergy} (${dgpSlotId})`, "cenergy", "col-1", "border-dark", "border-end");
                break;
            }
            case EventID.UseUltimate: { // Use Ultimate
                // Not required to send character energy since it's guaranteed to be 0.
                break;
            }
            case EventID.StatusEffect: { // Status Effect
                duration = log.event ? log.event.duration.toString() : "";
                colDmgHealDur = createTextLog(true, duration, "status", "col-1", "border-dark", "border-end");
                break;
            }
            case EventID.EnergyUpdate: { // Energy Update
                colAttackerEnergy = createTextLog(true, `${log.event.characterEnergy} (${dgpSlotId})`, "cenergy", "col-1", "border-dark", "border-end");
                break;
            }
            case EventID.MatchEnd: { // Match End
                var test = createTextLog(true, log.event.victorID.toString(), "matchend", "col-12");
                isMatchEndLog = true;
                row.append(test);
                break;
            }
            case EventID.StunEnd: { // Stun End
                break;
            }
        }

        // End of match log
        if (isMatchEndLog)
            return;

        // Create empty logs to fill the empty columns

        if (colDmgHealDur == undefined)
            colDmgHealDur = createTextLog(true, "", "damage", "col-1", "border-dark", "border-end");

        if (colTargetHP == undefined)
            colTargetHP = createTextLog(true, "", "targetHP", "col-1", "border-dark", "border-end");

        if (colAttackerEnergy == undefined)
            colAttackerEnergy = createTextLog(true, "", "cenergy", "col-1", "border-dark", "border-end");

        if (colTargetEnergy == undefined)
            colTargetEnergy = createTextLog(true, "", "tenergy", "col-1", "border-dark", "border-end");
            
        row.append(colDmgHealDur);
        row.append(colTargetHP);
        row.append(colAttackerEnergy);
        row.append(colTargetEnergy);
        row.append(colInstanceID);
        row.append(colTimestamp);

        // Only add in tags drop down if there are tags in the event.
        if (tags != undefined && showTags)
            row.append(colTags);
    });
}

function filterByInstanceID(instanceID) {
    var shouldAdd = true;

    if (selectedInstanceID.length > 0) {
        if (instanceID) {
            for (const [key, value] of Object.entries(selectedInstanceID)) {
                if (instanceID == key && value == true) {
                    shouldAdd = true;
                    break;
                }
                else {
                    shouldAdd = false;
                }
            }
        }
        else {
            shouldAdd = false;
        }
    }

    return shouldAdd;
}

function filterByCharacterID(characterID) {
    if (!characterID)
        return undefined;

    return _.find(selectedDGPs, function(cid) {
        return characterID == cid;
    });
}

function createTextLog(isTextCenter = false, text = "", type = "", ...colClasses) {

    var col = document.createElement("div");
    col.classList.add(...colClasses);

    var colText = document.createElement("p");
    isTextCenter ? colText.classList.add("card-text", "text-center") : colText.classList.add("card-text");

    if (text.length > 0) {
        switch (type) {

            case "log": {
                if (_.endsWith(text, "dead")) {
                    colText.setAttribute("style", "text-decoration:line-through");
                    colText.setAttribute("id", _.includes(text , "- friendly") ? "log-friendly-colour" : "log-enemy-colour");
                }
                break;
            }

            case "damage": {
                if (_.startsWith(text, "-")) {
                    text = _.replace(text, "-", "+");
                    colText.setAttribute("id", "log-heal-colour");
                }
                else {
                    text = `-${text}`;
                    colText.setAttribute("id", "log-damage-colour");
                }
                break;
            }

            case "status": {
                var num = parseInt(text);
                if (num > 1337)
                    text = "Permanent";
                else if (num <= 0)
                    text = "";
                else
                    text = text.concat(" secs");
                break;
            }

            case "matchend": {
                if (text == "2") {
                    text = "FRIENDLY WIN";
                    colText.setAttribute("id", "log-heal-colour");
                }
                else {
                    text = "ENEMY WIN";
                    colText.setAttribute("id", "log-damage-colour");
                }
                break;
            }
        }

        colText.innerHTML = text;
    }

    col.append(colText);
    return col;
}

function createDropDownLog(tags, ...colClasses) {

    var col = document.createElement("div");
    col.classList.add(...colClasses);

    var dropDown = document.createElement("div");
    dropDown.classList.add("dropdown-center", "text-center");

    var button = document.createElement("button");
    button.classList.add("btn", "btn-xs", "btn-dark", "dropdown-toggle");
    button.type = "button";
    button.setAttribute("data-bs-toggle", "dropdown");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("id", "log-dropdown-button");
    button.innerHTML = "Tags";

    var menu = document.createElement("ul");
    menu.classList.add("dropdown-menu", "dropdown-menu-dark");

    tags.forEach(tag => {
        var menuList = document.createElement("li");
        var menuListText = document.createElement("a");

        menuListText.classList.add("dropdown-item", "disabled");
        menuListText.setAttribute("href", "#");
        menuListText.innerHTML = tag;

        menuList.append(menuListText);
        menu.append(menuList);
    })

    col.append(dropDown);
    dropDown.append(button);
    dropDown.append(menu);

    return col;
}

function createCombatLogTagHeader() {
    // Tag header already exist
    if (divCombatLogHeaders.children.length >= 8)
        return false;

    var tagHeader = document.createElement("div");
    tagHeader.classList.add("col-1");
    var p = document.createElement("p");
    p.classList.add("card-text", "text-center");
    p.setAttribute("id", "header-text");
    p.innerHTML = "Tags";

    tagHeader.append(p);
    divCombatLogHeaders.append(tagHeader);

    // Shorten log column to accomodate for tags
    divCombatLogHeaders.children[0].classList.replace("col-6", "col-5");

    // Add borders to timestamp column
    divCombatLogHeaders.children[6].classList.add("border-dark", "border-end");

    return tagHeader;
}

function destroyCombatLogTagHeader() {
    // Not supposed to happen, tag header doesn't exist
    if (divCombatLogHeaders.children.length < 8)
        return false;

    // Delete tags column
    divCombatLogHeaders.removeChild(divCombatLogHeaders.children[7]);

    // Enlarge log column
    divCombatLogHeaders.children[0].classList.replace("col-5", "col-6");

    // Remove borders on timestamp column
    divCombatLogHeaders.children[6].classList.remove("border-dark", "border-end");

    resetCombatLog();
}

function resetCombatLog() {
    if (jsonFile == null)
        return;

    // Do not have to reset friendly/enemy container as it's only refreshing the combat log.
    resetContainers(false, false, true);
    addCombatLog(combatLog);
}

function resetContainers(friendlies = true, enemies = true, combatLog = true) {

    // First child is Friendlies label, do not remove
    if (friendlies) {
        while (divFriendlies.children[1]) {
            divFriendlies.removeChild(divFriendlies.children[1]);
        }
    }

    // First child is Enemies label, do not remove
    if (enemies) {
        while (divEnemies.children[1]) {
            divEnemies.removeChild(divEnemies.children[1]);
        }
    }

    if (combatLog) {
        while(divCombatLog.firstChild) {
            divCombatLog.removeChild(divCombatLog.firstChild);
        }
    }
}

function movePanel() {
    if (movePanelToLeft.checked) {
        divCombatLogCol.classList.replace("order-first", "order-last");
        divPanelCol.classList.replace("order-last", "order-first");
    }
    else {
        divCombatLogCol.classList.replace("order-last", "order-first");
        divPanelCol.classList.replace("order-first", "order-last");
    }
}

// EVENT LISTENERS

inputInstanceID.addEventListener('input', function (evt) {

    // Commas, numbers and white space allowed only
    const regex = /^[0-9, ]*$/g;

    // Invalid input
    if(!regex.test(this.value))
        return;

    // Spacebar and commas
    var instanceIDs = this.value.split(/[, ]/g);

    // Clear out array first
    while (selectedInstanceID.length > 0) {
        selectedInstanceID.pop();
    }

    instanceIDs.forEach(instanceID => {
        selectedInstanceID[instanceID] = true;
    });

    resetCombatLog();
});

showDmgFilter.addEventListener('change', function (evt) {
    resetCombatLog();
});

showHealFilter.addEventListener('change', function (evt) {
    resetCombatLog();
});

showBuffFilter.addEventListener('change', function (evt) {
    resetCombatLog();
});

showEnergyFilter.addEventListener('change', function (evt) {
    resetCombatLog();
});

showAnimFilter.addEventListener('change', function (evt) {
    resetCombatLog();
});

showTagFilter.addEventListener('change', function (evt) {

    localStorage.setItem(keyNames[1], evt.currentTarget.checked ? 1 : 0);

    if (evt.currentTarget.checked) {
        createCombatLogTagHeader();

        if (jsonFile != null)
            resetCombatLog();
    }
    else {
        destroyCombatLogTagHeader();
    }
});

showJsonFilter.addEventListener('change', function (evt) {

    localStorage.setItem(keyNames[2], evt.currentTarget.checked ? 1 : 0);

    if (jsonFile == null)
        return;

    window.jsonTextArea.value = evt.currentTarget.checked ? window.jsonString : "";
});

movePanelToLeft.addEventListener('change', function (evt) {
    localStorage.setItem(keyNames[3], evt.currentTarget.checked ? 1 : 0);

    movePanel();
});