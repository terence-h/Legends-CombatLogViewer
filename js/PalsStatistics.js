var canvasFriendly = document.getElementsByClassName("canvas-line-chart-friendly");
var canvasEnemy = document.getElementsByClassName("canvas-line-chart-enemy");
var friendlyNumbers = document.getElementsByClassName("friendly-numbers");
var enemyNumbers = document.getElementsByClassName("enemy-numbers");
var chartHeader = document.getElementById("chart-header");

var charts = [];
var damageCharting = [];
var damageTakenCharting = [];
var healingCharting = [];
var shieldDamageCharting = [];
var deathTimeCharting = [];

var dpsNumbers = [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var dmgTaken = [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var hpsNumbers = [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var shieldNumbers = [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var died = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];

var lastTimestamp = 0;

function setupChart() {

    var jsonFile = window.jsonFile;
    var combatLog = jsonFile.combatLog;
    var friendlies = jsonFile.characters[0].id != 1 ? jsonFile.characters.reverse() : jsonFile.characters;
    var enemies = jsonFile.enemy[0].id != 6 ? jsonFile.enemy.reverse() : jsonFile.enemy;

    damageCharting = [];
    healingCharting = [];
    damageTakenCharting = [];
    shieldDamageCharting = [];
    deathTimeCharting = [];

    dpsNumbers = [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    dmgTaken = [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    hpsNumbers = [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    shieldNumbers = [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    died = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];

    _.each(charts, (chart) => {
        chart.destroy();
    });

    _.each(friendlyNumbers, (text) => {
        text.innerHTML = "";
    });

    _.each(enemyNumbers, (text) => {
        text.innerHTML = "";
    });

    // im not having fun here.
    chartHeader.innerHTML = "STATISTICS";

    lastTimestamp = _.last(combatLog).timestamp;

    _.each(combatLog, (log) => {

        // This is a damage taken event
        if (log.eventID && log.eventID == 3) {

            // This is a shield damage taken event
            if (!log.characterID) {

                // Empty array, push a starting point of (0,0) to the array first
                if (!shieldDamageCharting[log.event.targetID]) {
                    shieldDamageCharting[log.event.targetID] = [];
                    shieldDamageCharting[log.event.targetID].push({
                        x: 0,
                        y: 0
                    });
                }

                // Get the last log, if it exist
                var lastLog = shieldDamageCharting[log.event.targetID][shieldDamageCharting[log.event.targetID].length - 1];

                shieldDamageCharting[log.event.targetID].push({
                    x: log.timestamp,
                    y: log.event.damageAmount + (lastLog != null ? lastLog.y : 0)
                });
                return;
            }

            // This is a heal event
            if (_.includes(log.log, "heals")) {
                if (!healingCharting[log.characterID]) {
                    healingCharting[log.characterID] = [];
                    healingCharting[log.characterID].push({
                        x: 0,
                        y: 0
                    });
                }

                // Get the last log, if it exist
                var lastLog = healingCharting[log.characterID][healingCharting[log.characterID].length - 1];

                // We want the total heal and not each individual heal, so we take the last log and add the heal.
                healingCharting[log.characterID].push({
                    x: log.timestamp,
                    y: Math.abs(log.event.damageAmount) + (lastLog != null ? lastLog.y : 0)
                });

                // HPS numbers (not adjusted for death)
                hpsNumbers[log.characterID] = _.last(healingCharting[log.characterID]).y;
            }
            // This is a damage event
            else {
                
                // Empty array, push a starting point of (0,0) to the array first
                if (!damageCharting[log.characterID]) {
                    damageCharting[log.characterID] = [];
                    damageCharting[log.characterID].push({
                        x: 0,
                        y: 0
                    });
                }

                // Get the last log, if it exist
                var lastLog = damageCharting[log.characterID][damageCharting[log.characterID].length - 1];

                // We want the total damage and not each individual damage, so we take the last log and add the damage.
                damageCharting[log.characterID].push({
                    x: log.timestamp,
                    y: log.event.damageAmount + (lastLog != null ? lastLog.y : 0)
                });

                // DPS numbers (not adjusted for death)
                dpsNumbers[log.characterID] = _.last(damageCharting[log.characterID]).y;

                // We only want to parse damage in if the target health is actually reduced
                if (log.event.damageAmount > 0) {

                    // Damage in
                    if (!damageTakenCharting[log.event.targetID]) {
                        damageTakenCharting[log.event.targetID] = [];
                        damageTakenCharting[log.event.targetID].push({
                            x: 0,
                            y: 0
                        });
                    }

                    // Get the last log, if it exist
                    lastLog = damageTakenCharting[log.event.targetID][damageTakenCharting[log.event.targetID].length - 1];

                    // We want the total damage and not each individual damage, so we take the last log and add the damage.
                    damageTakenCharting[log.event.targetID].push({
                        x: log.timestamp,
                        y: log.event.damageAmount + (lastLog != null ? lastLog.y : 0)
                    });

                    dmgTaken[log.event.targetID] = _.last(damageTakenCharting[log.event.targetID]).y;
                }
            }
            return;
        }

        // This is a death event
        if (log.event && log.eventID == 4) {
            deathTimeCharting[log.characterID] = [];
            deathTimeCharting[log.characterID].push({
                x: log.timestamp,
                y: 0
            });

            died[log.characterID] = log.timestamp;
        }
    });

    // Sort the charting by timestamp incase the timestamp is not in ordered due to combat log issue
    _.each(damageCharting, (charting) => { charting = _.orderBy(charting, ["x"], ["asc"]); });
    _.each(damageTakenCharting, (charting) => { charting = _.orderBy(charting, ["x"], ["asc"]); });
    _.each(healingCharting, (charting) => { charting = _.orderBy(charting, ["x"], ["asc"]); });
    _.each(shieldDamageCharting, (charting) => { charting = _.orderBy(charting, ["x"], ["asc"]); });

    _.each(friendlies, (friendly, key) => {
        drawChart(friendly, key);
        updateNumbers(friendly, key);
    });

    _.each(enemies, (enemy, key) => {
        drawChart(enemy, key, true);
        updateNumbers(enemy, key, true);
    });
}

function drawChart(data, index = -1, isEnemy = false) {

    var shortenedName = _.replace(data.name, isEnemy ? " - enemy" : " - friendly", "");

    const chartData = {
        datasets: [
            {
                label: shortenedName + " (Damage out)",
                data: damageCharting[data.id],
                borderColor: 'rgb(200, 0, 0)',
                backgroundColor: 'rgb(200, 0, 0)',
                fill: false,
                showLine: true,
            },
            {
                label: shortenedName + " (Heal out)",
                data: healingCharting[data.id],
                borderColor: 'rgb(0, 200, 0)',
                backgroundColor: 'rgb(0, 200, 0)',
                fill: false,
                showLine: true
            },
            {
                label: shortenedName + " (Damage in)",
                data: damageTakenCharting[data.id],
                borderColor: 'rgb(200, 0, 200)',
                backgroundColor: 'rgb(200, 0, 200)',
                fill: false,
                showLine: true
            },
            {
                label: shortenedName + " (Damage in by shield)",
                data: shieldDamageCharting[data.id],
                borderColor: 'rgb(0, 0, 200)',
                backgroundColor: 'rgb(0, 0, 200)',
                fill: false,
                showLine: true
            },
            {
                label: shortenedName + " (Death)",
                data: deathTimeCharting[data.id],
                borderColor: 'rgb(64, 64, 64)',
                backgroundColor: 'rgb(64, 64, 64)',
                fill: false,
                showLine: true
            }
        ]
    };

    charts.push(new Chart(isEnemy ? canvasEnemy[index] : canvasFriendly[index], {
        type: 'scatter',
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top"
                }
            },
            scales: {
                x: {
                    suggestedMin: 0,
                    suggestedMax: _.ceil(lastTimestamp),
                    ticks: {
                        stepSize: 1,
                        beginAtZero: true,
                    },
                    title: {
                        display: true,
                        text: "Timestamp"
                    }
                },
                y: {
                    suggestedMin: 0,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Damage/Heal"
                    }
                }
            }
        }
    }));
}

function updateNumbers(data, index = -1, isEnemy = false) {

    var dps = dpsNumbers[data.id] ? _.round(dpsNumbers[data.id] / lastTimestamp, 1) : 0;
    var dpsTillDeath = deathTimeCharting[data.id] ? _.round(dpsNumbers[data.id] / deathTimeCharting[data.id][0].x, 1) : dps > 0 ? dps : 0;

    var hps = hpsNumbers[data.id] ? _.round(hpsNumbers[data.id] / lastTimestamp, 1) : 0;
    var hpsTillDeath = deathTimeCharting[data.id] ? _.round(hpsNumbers[data.id] / deathTimeCharting[data.id][0].x, 1) : hps > 0 ? hps : 0;

    var dmgTakenPs = dmgTaken[data.id] ? _.round(dmgTaken[data.id] / lastTimestamp, 1) : 0;
    var dtpsTillDeath = deathTimeCharting[data.id] ? _.round(dmgTaken[data.id] / deathTimeCharting[data.id][0].x, 1) : dmgTakenPs > 0 ? dmgTakenPs : 0;

    isEnemy ? enemyNumbers[index].innerHTML =
            `<span style='text-decoration: underline;'>Until End of Combat (${lastTimestamp})</span><br />
            Damage per second: ${dps}<br />
            Heal per second: ${hps}<br />
            Damage taken per second: ${dmgTakenPs}<br /><br />
            <span style='text-decoration: underline;'>Until Death ${died[data.id] >=0 ? `(${died[data.id].toFixed(3)})` : ""}</span><br />
            Damage per second: ${died[data.id] >= 0 ? dpsTillDeath : "-"}<br />
            Heal per second: ${died[data.id] >= 0 ? hpsTillDeath : "-"}<br />
            Damage taken per second: ${died[data.id] >= 0 ? dtpsTillDeath : "-"}`
            
            : friendlyNumbers[index].innerHTML =
            `<span style='text-decoration: underline;'>Until End of Combat (${lastTimestamp})</span><br />
            Damage per second: ${dps}<br />
            Heal per second: ${hps}<br />
            Damage taken per second: ${dmgTakenPs}<br /><br />
            <span style='text-decoration: underline;'>Until Death ${died[data.id] >=0 ? `(${died[data.id].toFixed(3)})` : ""}</span><br />
            Damage per second: ${died[data.id] >= 0 ? dpsTillDeath : "-"}<br />
            Heal per second: ${died[data.id] >= 0 ? hpsTillDeath : "-"}<br />
            Damage taken per second: ${died[data.id] >= 0 ? dtpsTillDeath : "-"}`;
}