$enc = New-Object System.Text.UTF8Encoding $false
$main = 'c:\Numbers\NumbersareFun\ascension-tree-data.js'
$frag = 'c:\Numbers\NumbersareFun\_ascension_finalize_block.js'
$arrPath = 'c:\Numbers\NumbersareFun\_ascension_nodes_array.txt'

$s = [IO.File]::ReadAllText($main, $enc)
$s = $s -replace "(?m)^    var BRANCH_LEN = 25;\r?\n", ""

$start = $s.IndexOf("    function pad2(n) {")
$endMarker = "    var NODES = buildNodes();"
$end = $s.IndexOf($endMarker, $start)
if ($start -lt 0 -or $end -lt 0) { throw "splice markers not found: start=$start end=$end" }
$end += $endMarker.Length

$mid = [IO.File]::ReadAllText($frag, $enc) + [IO.File]::ReadAllText($arrPath, $enc).TrimStart([char]0xFEFF) + "`r`n    var NODES = finalizeAscensionNodes(ASCENSION_NODES);`r`n    var BRANCH_LEN = inferBranchLen(NODES);`r`n"

$out = $s.Substring(0, $start) + $mid + $s.Substring($end)

# Ensure export lists ASCENSION_NODES (idempotent)
if (-not $out.Contains('ASCENSION_NODES: ASCENSION_NODES')) {
    $out = $out.Replace("        BRANCH_LEN: BRANCH_LEN,`r`n        NODES: NODES,", "        BRANCH_LEN: BRANCH_LEN,`r`n        ASCENSION_NODES: ASCENSION_NODES,`r`n        NODES: NODES,")
    if (-not $out.Contains('ASCENSION_NODES: ASCENSION_NODES')) {
        $out = $out.Replace("        BRANCH_LEN: BRANCH_LEN,`n        NODES: NODES,", "        BRANCH_LEN: BRANCH_LEN,`n        ASCENSION_NODES: ASCENSION_NODES,`n        NODES: NODES,")
    }
}

[IO.File]::WriteAllText($main, $out, $enc)
Write-Host "spliced ok, length" $out.Length
