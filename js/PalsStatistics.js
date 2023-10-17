var canvasFriendly = document.getElementsByClassName("canvas-line-chart-friendly");
var canvasEnemy = document.getElementsByClassName("canvas-line-chart-enemy");
var damageCharting = [];
var healingCharting = [];
var lastTimestamp = 0;

function setupChart() {

    var jsonFile = window.jsonFile;
    var combatLog = jsonFile.combatLog;
    var friendlies = jsonFile.characters[0].id != 1 ? jsonFile.characters.reverse() : jsonFile.characters;
    var enemies = jsonFile.enemy[0].id != 6 ? jsonFile.enemy.reverse() : jsonFile.enemy;

    damageCharting = [];
    healingCharting = [];

    lastTimestamp = _.last(combatLog).timestamp;

    _.each(combatLog, (log) => {
        if (!log.characterID)
            return;

        if (log.eventID && log.eventID == 3) {

            //if (log.event.damageAmount > 0) {
            if (_.includes(log.log, "heals")) {
                if (!healingCharting[log.characterID]) {
                    healingCharting[log.characterID] = [];
                    healingCharting[log.characterID].push({
                        x: 0,
                        y: 0
                    });
                }

                var lastLog = healingCharting[log.characterID][healingCharting[log.characterID].length - 1];

                healingCharting[log.characterID].push({
                    x: log.timestamp,
                    y: Math.abs(log.event.damageAmount) + (lastLog != null ? lastLog.y : 0)
                });
            }
            else {
                if (!damageCharting[log.characterID]) {
                    damageCharting[log.characterID] = [];
                    damageCharting[log.characterID].push({
                        x: 0,
                        y: 0
                    });
                }

                var lastLog = damageCharting[log.characterID][damageCharting[log.characterID].length - 1];

                damageCharting[log.characterID].push({
                    x: log.timestamp,
                    y: log.event.damageAmount + (lastLog != null ? lastLog.y : 0)
                });
            }
        }
    });

    console.log("Damage Logs")
    console.log(damageCharting);
    console.log("Healing Logs");
    console.log(healingCharting);

    _.each(friendlies, (friendly) => {
        drawChart(friendly);
    });

    _.each(enemies, (enemy) => {
        drawChart(enemy, true);
    });
}

function drawChart(data, isEnemy = false) {

    const chartData = {
        datasets: [
            {
                label: data.name + " (Damage)",
                data: damageCharting[data.id],
                borderColor: 'rgb(200, 0, 0)',
                backgroundColor: 'rgb(200, 0, 0)',
                fill: false,
                showLine: true,
            },
            {
                label: data.name + " (Heal)",
                data: healingCharting[data.id],
                borderColor: 'rgb(0, 200, 0)',
                backgroundColor: 'rgb(0, 200, 0)',
                fill: false,
                showLine: true
            }
        ]
    };

    new Chart(isEnemy ? canvasEnemy[data.id - 6] : canvasFriendly[data.id - 1], {
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
    });
}