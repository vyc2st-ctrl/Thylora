"""Assemble SPINE-610-PHASE-2-REPORT.md from report-parts/. Run from spine-610/ after build_catalog_section.py."""
import pathlib
R = pathlib.Path(__file__).resolve().parent.parent
P = R / "report-parts"
parts = [P / "00-head.md", "## 4. Every product — itemized (checks 1–7 with the equation beside each)\n", P / "40-catalog.md",
         P / "50-twelve-miles.md", P / "60-batch.md", P / "70-sponsor-pilot-post.md", P / "90-continuity.md"]
out = [p.read_text() if isinstance(p, pathlib.Path) else p for p in parts]
(R / "SPINE-610-PHASE-2-REPORT.md").write_text("\n\n---\n\n".join(out))
print("written", sum(len(x) for x in out), "chars")
