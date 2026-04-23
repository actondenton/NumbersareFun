$enc = New-Object System.Text.UTF8Encoding $false
$main = 'c:\Numbers\NumbersareFun\ascension-tree-data.js'
$arrPath = 'c:\Numbers\NumbersareFun\_ascension_route_seeds.txt'
$arr = [IO.File]::ReadAllText($arrPath, $enc).TrimStart([char]0xFEFF).TrimEnd()
$s = [IO.File]::ReadAllText($main, $enc)
$start = $s.IndexOf("    var ASCENSION_ROUTE_SEEDS = {")
$end = $s.IndexOf("    var ASCENSION_NODES = expandBraidedFromFingerSeeds(ASCENSION_ROUTE_SEEDS);", $start)
if ($start -lt 0 -or $end -lt 0) { throw "ASCENSION_ROUTE_SEEDS / ASCENSION_NODES markers not found" }
$out = $s.Substring(0, $start) + $arr + "`r`n`r`n" + $s.Substring($end)
[IO.File]::WriteAllText($main, $out, $enc)
Write-Host "refreshed ASCENSION_ROUTE_SEEDS in ascension-tree-data.js"
