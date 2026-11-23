"""Assemble board.html from tools/board-src.html plus the shared music / crowd / confetti / clapping-hands code
of the Investigative Reporter board (pegasus028/InvestigativeReporter, leaderboard.html).
Usage: python3 tools/build-board.py <path to InvestigativeReporter/leaderboard.html>"""
import re, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ref = open(sys.argv[1], encoding='utf-8').read()
src = open(os.path.join(ROOT, 'tools', 'board-src.html'), encoding='utf-8').read()

def between(start, end):
    i = ref.index(start); j = ref.index(end, i)
    return ref[i:j]

music = between("let music=null, musicOn=true;", "/* music plays only while")
music = music.replace("localStorage.getItem('invrep-music')", "localStorage.getItem('shortlist-music')")
crowd = between("function noiseBuffer(c, seconds){", "/* ============================================================\n   CONFETTI")
confetti = between("const cvs=document.getElementById('confetti')", "/* ============================================================\n   CLOCK")
confetti = confetti.replace("['#c8961e','#f4ead7','#2f7d52','#b8442f','#7a5cc4','#e2851d','#cfc3a8']", "['#e2b553','#efe9dd','#6cc49a','#e0606f','#7fb0e0','#f08a55','#cfd3da']")
claps = between("function clapSVG(){", "function showPodium(){")
clapcss = between("  .clapside{position:absolute", "  @media (max-width:1180px){ .clapside{display:none} }") + "  @media (max-width:1180px){ .clapside{display:none} }\n"
out = (src.replace('/*@@MUSIC@@*/', music).replace('/*@@CROWD@@*/', crowd)
          .replace('/*@@CONFETTI@@*/', confetti).replace('/*@@CLAPS@@*/', claps).replace('/*@@CLAPCSS@@*/', clapcss))
assert '@@' not in out
open(os.path.join(ROOT, 'board.html'), 'w', encoding='utf-8').write(out)
print('board.html written', len(out), 'bytes')
