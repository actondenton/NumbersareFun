# Obsolete: emitted flat var ASCENSION_NODES = [ ... ] with x,y. The game now uses ASCENSION_ROUTE_SEEDS (cost+grants only)
# and expandBraidedFromFingerSeeds in ascension-tree-data.js. To splice bulk edits: _ascension_route_seeds.txt +
# powershell -File _refresh_ascension_array.ps1

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

# Same 0–100 viewBox space as HUB_CENTER / FINGERTIP_TARGETS in ascension-tree-data.js
$hubX = 50
$hubY = 51
$tLay0 = 0.09
$tLay1 = 0.93
$tipByFinger = @{
    'index'  = @{ x = 44; y = 10 }
    'middle' = @{ x = 33; y = 0 }
    'ring'   = @{ x = 15; y = 15 }
    'pinky'  = @{ x = 5; y = 30 }
    'thumb'  = @{ x = 85; y = 80 }
}
$ci = [System.Globalization.CultureInfo]::InvariantCulture

$nodeLines = New-Object System.Collections.ArrayList
foreach ($finger in @('index', 'middle', 'ring', 'pinky', 'thumb')) {
    $route = switch ($finger) {
        'index' { 'velocity' }; 'middle' { 'combo' }; 'ring' { 'turbo' }; 'pinky' { 'warp' }; default { 'clap' }
    }
    $pfx = switch ($finger) {
        'index' { 'asc_ix' }; 'middle' { 'asc_md' }; 'ring' { 'asc_rg' }; 'pinky' { 'asc_pk' }; default { 'asc_th' }
    }
    $base = if ($finger -eq 'ring') { 7 } elseif ($finger -eq 'pinky') { 6 } else { 5 }
    $tip = $tipByFinger[$finger]
    $dx = $tip.x - $hubX
    $dy = $tip.y - $hubY
    $den = 24
    for ($i = 0; $i -lt 25; $i++) {
        $id = "$pfx`_$(Pad2 $i)"
        $parents = if ($i -eq 0) { '[]' } else { "['$pfx`_$(Pad2 ($i-1))']" }
        $g = switch ($finger) {
            'index' { GVel $i }; 'middle' { GCombo $i }; 'ring' { GTurbo $i }; 'pinky' { GWarp $i }; default { GClap $i }
        }
        $cost = [math]::Max(1, [math]::Floor($base * [math]::Pow(1.104, $i)))
        $u = if ($den -le 0) { 0.5 } else { $i / $den }
        $tpar = $tLay0 + ($tLay1 - $tLay0) * $u
        $px = $hubX + $dx * $tpar
        $py = $hubY + $dy * $tpar
        $xs = [string]::Format($ci, '{0:0.###}', $px)
        $ys = [string]::Format($ci, '{0:0.###}', $py)
        [void]$nodeLines.Add('        { id: ''' + $id + ''', finger: ''' + $finger + ''', parents: ' + $parents + ', route: ''' + $route + ''', cost: ' + $cost + ', branchIndex: ' + $i + ', x: ' + $xs + ', y: ' + $ys + ', grants: ' + $g + ' }')
    }
}
$body = @"
    var ASCENSION_NODES = [
$(($nodeLines -join ",`n"))
    ];
"@
$body | Set-Content -Path "c:\Numbers\NumbersareFun\_ascension_nodes_array.txt" -Encoding UTF8
