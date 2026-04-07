# Writes _ascension_nodes_array.txt (var ASCENSION_NODES = [ ... ];). To refresh ascension-tree-data.js
# after editing this script, run _splice_ascension.ps1 (uses _ascension_finalize_block.js + the txt file).

function Pad2([int]$n) { if ($n -lt 10) { "0$n" } else { "$n" } }
function GVel([int]$i) {
    $m = $i % 4
    if ($m -eq 0) { return '{ speedCostMult: 0.99 }' }
    if ($m -eq 1) { return '{ cheapenCap: 1 }' }
    if ($m -eq 2) { return '{ autoBuyDelayMult: 0.97 }' }
    return '{ slowdownCostMult: 0.94 }'
}
function GCombo([int]$i) {
    $m = $i % 3
    if ($m -eq 0) { return '{ comboMultAdd: 0.004 }' }
    if ($m -eq 1) { return '{ comboTriggerProductionFrac: 0.004 }' }
    return '{ comboMultAdd: 0.003 }'
}
function GTurbo([int]$i) {
    if (($i % 2) -eq 0) { return '{ turboScaling: 1 }' }
    return '{ comboTurboPointsMult: 0.07 }'
}
function GWarp([int]$i) {
    if (($i % 2) -eq 0) { return '{ warpOverflow: 1 }' }
    return '{ warpSpawnIntervalMult: 0.965 }'
}
function GClap([int]$i) {
    if (($i % 2) -eq 0) { return '{ clapCooldownMult: 0.987 }' }
    return '{ clapBonusChanceAdd: 0.006 }'
}

$nodeLines = New-Object System.Collections.ArrayList
foreach ($finger in @('index', 'middle', 'ring', 'pinky', 'thumb')) {
    $route = switch ($finger) {
        'index' { 'velocity' }; 'middle' { 'combo' }; 'ring' { 'turbo' }; 'pinky' { 'warp' }; default { 'clap' }
    }
    $pfx = switch ($finger) {
        'index' { 'asc_ix' }; 'middle' { 'asc_md' }; 'ring' { 'asc_rg' }; 'pinky' { 'asc_pk' }; default { 'asc_th' }
    }
    $base = if ($finger -eq 'ring') { 7 } elseif ($finger -eq 'pinky') { 6 } else { 5 }
    for ($i = 0; $i -lt 25; $i++) {
        $id = "$pfx`_$(Pad2 $i)"
        $parents = if ($i -eq 0) { '[]' } else { "['$pfx`_$(Pad2 ($i-1))']" }
        $g = switch ($finger) {
            'index' { GVel $i }; 'middle' { GCombo $i }; 'ring' { GTurbo $i }; 'pinky' { GWarp $i }; default { GClap $i }
        }
        $cost = [math]::Max(1, [math]::Floor($base * [math]::Pow(1.104, $i)))
        [void]$nodeLines.Add('        { id: ''' + $id + ''', finger: ''' + $finger + ''', parents: ' + $parents + ', route: ''' + $route + ''', cost: ' + $cost + ', branchIndex: ' + $i + ', grants: ' + $g + ' }')
    }
}
$body = @"
    var ASCENSION_NODES = [
$(($nodeLines -join ",`n"))
    ];
"@
$body | Set-Content -Path "c:\Numbers\NumbersareFun\_ascension_nodes_array.txt" -Encoding UTF8
